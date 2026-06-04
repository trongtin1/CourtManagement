CREATE OR ALTER PROCEDURE dbo.sp_CreateRecurringBookingGroup
    @CustomerID INT,
    @FacilityID INT,
    @CourtID INT,
    @StartDate DATE,
    @EndDate DATE,
    @StartTime TIME(7),
    @EndTime TIME(7),
    @DaysOfWeek NVARCHAR(100),
    @CreatedBy NVARCHAR(100),
    @Note NVARCHAR(MAX),
    @FlatRatePrice DECIMAL(18,2) = NULL,
    @ErrorMessage NVARCHAR(MAX) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
    SET DATEFIRST 7;

    DECLARE @BookingGroupID INT = 0;
    DECLARE @BufferDurationMinutes INT = 10;
    SET @ErrorMessage = NULL;

    SELECT TOP 1 
        @BufferDurationMinutes = ISNULL(BufferDurationMinutes, 10)
    FROM SystemSettings;

    BEGIN TRY
        BEGIN TRANSACTION;

        -- 1. Thêm nhóm lịch định kỳ mới
        INSERT INTO BookingGroups (
            GroupType, CustomerID, FacilityID, TotalAmount, PaidAmount, Status, Note,
            CreatedDate, CreatedBy, ModifiedDate, ModifiedBy
        )
        VALUES (
            'returning', @CustomerID, @FacilityID, ISNULL(@FlatRatePrice, 0), 0, 'confirmed', ISNULL(@Note, ''),
            SYSDATETIMEOFFSET(), @CreatedBy, SYSDATETIMEOFFSET(), @CreatedBy
        );

        SET @BookingGroupID = SCOPE_IDENTITY();

        -- 2. Thêm cấu hình lặp Recurring Configs
        INSERT INTO RecurringConfigs (
            BookingGroupID, CourtID, StartDate, EndDate, StartTime, EndTime, DaysOfWeek
        )
        VALUES (
            @BookingGroupID, @CourtID, @StartDate, @EndDate, @StartTime, @EndTime, @DaysOfWeek
        );

        -- 3. Xác định danh sách các ngày chơi
        CREATE TABLE #TargetDates (
            TargetDate DATE NOT NULL
        );

        DECLARE @Cursor DATE = @StartDate;

        WHILE @Cursor <= @EndDate
        BEGIN
            DECLARE @dow INT = DATEPART(WEEKDAY, @Cursor) - 1;

            IF CHARINDEX(',' + CAST(@dow AS VARCHAR(10)) + ',', ',' + REPLACE(@DaysOfWeek, ' ', '') + ',') > 0
            BEGIN
                INSERT INTO #TargetDates (TargetDate)
                VALUES (@Cursor);
            END

            SET @Cursor = DATEADD(DAY, 1, @Cursor);
        END;

        IF NOT EXISTS (SELECT 1 FROM #TargetDates)
        BEGIN
            SET @ErrorMessage = N'Không tìm thấy ngày nào khớp với lịch lặp trong khoảng thời gian đã chọn.';
            THROW 50000, @ErrorMessage, 1;
        END;

        -- 4. Kiểm tra trùng lịch của khung giờ trên sân đấu
        DECLARE @OverlappingDate DATE = NULL;

        SELECT TOP 1 @OverlappingDate = td.TargetDate
        FROM #TargetDates td
        INNER JOIN BookingSlots bs
            ON bs.CourtID = @CourtID
           AND bs.BookingDate = td.TargetDate
           AND bs.StartTime < DATEADD(MINUTE, @BufferDurationMinutes, @EndTime)
           AND DATEADD(MINUTE, @BufferDurationMinutes, bs.EndTime) > @StartTime
        INNER JOIN Bookings b
            ON b.BookingID = bs.BookingID
           AND b.Status <> 'cancelled'
        ORDER BY td.TargetDate;

        IF @OverlappingDate IS NOT NULL
        BEGIN
            DECLARE @DateStr NVARCHAR(20) = CONVERT(NVARCHAR(20), @OverlappingDate, 103);

            SET @ErrorMessage =
                N'Trùng lịch tại ngày ' + @DateStr +
                N' vào lúc ' + LEFT(CONVERT(NVARCHAR(8), @StartTime), 5) +
                N' - ' + LEFT(CONVERT(NVARCHAR(8), @EndTime), 5) +
                N'. Khung giờ này đã được đặt.';

            THROW 50000, @ErrorMessage, 1;
        END;

        -- 5. Tính giá tự động cho toàn bộ danh sách ngày lặp bằng cách tính tỷ lệ theo phút (pro-rated) dựa trên Price Rules
        CREATE TABLE #BookingPrices (
            TargetDate DATE NOT NULL,
            TotalPrice DECIMAL(18,2) NOT NULL
        );

        INSERT INTO #BookingPrices (TargetDate, TotalPrice)
        SELECT 
            td.TargetDate,
            ISNULL(SUM(
                CASE 
                    WHEN r.StartTime < @EndTime AND r.EndTime > @StartTime 
                    THEN 
                        DATEDIFF(MINUTE, 
                            CASE WHEN r.StartTime > @StartTime THEN r.StartTime ELSE @StartTime END,
                            CASE WHEN r.EndTime < @EndTime THEN r.EndTime ELSE @EndTime END
                        ) / 60.0 * r.Price
                    ELSE 0 
                END
            ), 0) AS TotalPrice
        FROM #TargetDates td
        CROSS APPLY (
            SELECT 
                r.StartTime, 
                r.EndTime, 
                r.Price
            FROM (
                -- Ưu tiên 1: Court Price Rules cho SpecificDate
                SELECT StartTime, EndTime, Price, 1 AS Priority
                FROM CourtPriceRules
                WHERE CourtID = @CourtID AND IsActive = 1 AND SpecificDate = td.TargetDate
                
                UNION ALL
                
                -- Ưu tiên 2: Court Price Rules cho DayOfWeek
                SELECT StartTime, EndTime, Price, 2 AS Priority
                FROM CourtPriceRules
                WHERE CourtID = @CourtID AND IsActive = 1 AND SpecificDate IS NULL AND DayOfWeek = (DATEPART(WEEKDAY, td.TargetDate) - 1)
                  AND NOT EXISTS (SELECT 1 FROM CourtPriceRules WHERE CourtID = @CourtID AND IsActive = 1 AND SpecificDate = td.TargetDate)
                
                UNION ALL
                
                -- Ưu tiên 3: Court Default Price Rules cho SpecificDate
                SELECT StartTime, EndTime, Price, 3 AS Priority
                FROM CourtDefaultPriceRules
                WHERE IsActive = 1 AND IsMapping = 1 AND SpecificDate = td.TargetDate
                  AND NOT EXISTS (SELECT 1 FROM CourtPriceRules WHERE CourtID = @CourtID AND IsActive = 1 AND (SpecificDate = td.TargetDate OR (SpecificDate IS NULL AND DayOfWeek = (DATEPART(WEEKDAY, td.TargetDate) - 1))))
                
                UNION ALL
                
                -- Ưu tiên 4: Court Default Price Rules cho DayOfWeek
                SELECT StartTime, EndTime, Price, 4 AS Priority
                FROM CourtDefaultPriceRules
                WHERE IsActive = 1 AND IsMapping = 1 AND SpecificDate IS NULL AND DayOfWeek = (DATEPART(WEEKDAY, td.TargetDate) - 1)
                  AND NOT EXISTS (SELECT 1 FROM CourtPriceRules WHERE CourtID = @CourtID AND IsActive = 1 AND (SpecificDate = td.TargetDate OR (SpecificDate IS NULL AND DayOfWeek = (DATEPART(WEEKDAY, td.TargetDate) - 1))))
                  AND NOT EXISTS (SELECT 1 FROM CourtDefaultPriceRules WHERE IsActive = 1 AND IsMapping = 1 AND SpecificDate = td.TargetDate)
            ) r
        ) r
        GROUP BY td.TargetDate;

        -- 6. Sinh các ID đặt sân ngẫu nhiên và lưu trữ trước khi chèn (Set-Based)
        CREATE TABLE #NewBookings (
            BookingID UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
            TargetDate DATE NOT NULL,
            TotalPrice DECIMAL(18,2) NOT NULL
        );

        INSERT INTO #NewBookings (TargetDate, TotalPrice)
        SELECT TargetDate, TotalPrice
        FROM #BookingPrices;

        -- Chèn dữ liệu vào bảng Bookings
        INSERT INTO Bookings (
            BookingID, CourtID, CustomerID, BookingDate, StartTime, EndTime,
            TotalAmount, PaidAmount, Status, CancellationReason, Note, BookingGroupID,
            CreatedDate, CreatedBy, ModifiedDate, ModifiedBy
        )
        SELECT 
            nb.BookingID, 
            @CourtID, 
            @CustomerID, 
            CAST(nb.TargetDate AS DATETIME),
            @StartTime, 
            @EndTime, 
            CASE WHEN @FlatRatePrice IS NOT NULL AND @FlatRatePrice > 0 THEN 0 ELSE nb.TotalPrice END, 
            0, 
            'confirmed', 
            N'',
            N'[Đặt định kỳ] Nhóm ID: #' + CAST(@BookingGroupID AS NVARCHAR(20)),
            @BookingGroupID,
            SYSDATETIMEOFFSET(), 
            @CreatedBy, 
            SYSDATETIMEOFFSET(), 
            @CreatedBy
        FROM #NewBookings nb;

        -- Chèn dữ liệu vào bảng BookingSlots
        INSERT INTO BookingSlots (
            BookingID, CourtID, BookingDate, StartTime, EndTime
        )
        SELECT 
            nb.BookingID, 
            @CourtID, 
            CAST(nb.TargetDate AS DATETIME), 
            @StartTime, 
            @EndTime
        FROM #NewBookings nb;

        -- 7. Tính toán lại tổng tiền của cả nhóm nếu không phải giá trọn gói
        IF @FlatRatePrice IS NULL OR @FlatRatePrice <= 0
        BEGIN
            DECLARE @TotalGroupAmount DECIMAL(18,2) = 0;

            SELECT @TotalGroupAmount = ISNULL(SUM(TotalPrice), 0)
            FROM #BookingPrices;

            UPDATE BookingGroups
            SET TotalAmount = @TotalGroupAmount
            WHERE BookingGroupID = @BookingGroupID;
        END;

        COMMIT TRANSACTION;

        DROP TABLE #TargetDates;
        DROP TABLE #BookingPrices;
        DROP TABLE #NewBookings;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        IF @ErrorMessage IS NULL
            SET @ErrorMessage = ERROR_MESSAGE();

        IF OBJECT_ID('tempdb..#TargetDates') IS NOT NULL DROP TABLE #TargetDates;
        IF OBJECT_ID('tempdb..#BookingPrices') IS NOT NULL DROP TABLE #BookingPrices;
        IF OBJECT_ID('tempdb..#NewBookings') IS NOT NULL DROP TABLE #NewBookings;

        THROW 50000, @ErrorMessage, 1;
    END CATCH;
END;
GO