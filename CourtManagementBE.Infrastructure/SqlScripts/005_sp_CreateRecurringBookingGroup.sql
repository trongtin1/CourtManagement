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
    DECLARE @SlotDurationMinutes INT = 60;
    SET @ErrorMessage = NULL;

    SELECT TOP 1 @SlotDurationMinutes = ISNULL(SlotDurationMinutes, 60)
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
           AND bs.StartTime < @EndTime
           AND bs.EndTime > @StartTime
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

        -- 5. Phân tích khung giờ thành các slot dựa trên cấu hình SlotDurationMinutes để áp giá dịch vụ (Set-Based)
        CREATE TABLE #HourlySlots (
            StartTime TIME(7) NOT NULL,
            EndTime TIME(7) NOT NULL
        );

        WITH HourlyCTE AS (
            SELECT @StartTime AS StartTime, 
                   CASE WHEN DATEADD(MINUTE, @SlotDurationMinutes, @StartTime) > @EndTime THEN @EndTime ELSE DATEADD(MINUTE, @SlotDurationMinutes, @StartTime) END AS EndTime
            UNION ALL
            SELECT EndTime, 
                   CASE WHEN DATEADD(MINUTE, @SlotDurationMinutes, EndTime) > @EndTime THEN @EndTime ELSE DATEADD(MINUTE, @SlotDurationMinutes, EndTime) END
            FROM HourlyCTE
            WHERE EndTime < @EndTime
        )
        INSERT INTO #HourlySlots (StartTime, EndTime)
        SELECT StartTime, EndTime FROM HourlyCTE;

        -- 6. Tính giá tự động cho toàn bộ danh sách ngày lặp (Set-Based)
        CREATE TABLE #BookingPrices (
            TargetDate DATE NOT NULL,
            TotalPrice DECIMAL(18,2) NOT NULL
        );

        INSERT INTO #BookingPrices (TargetDate, TotalPrice)
        SELECT 
            td.TargetDate,
            ISNULL(SUM(ISNULL(COALESCE(cp1.Price, cp2.Price, dp1.Price, dp2.Price), 0)), 0) AS TotalPrice
        FROM #TargetDates td
        CROSS JOIN #HourlySlots hs
        OUTER APPLY (
            SELECT TOP 1 p.Price
            FROM CourtPriceRules p
            WHERE p.CourtID = @CourtID
              AND p.IsActive = 1
              AND p.SpecificDate = td.TargetDate
              AND p.StartTime <= hs.StartTime
              AND p.EndTime >= hs.EndTime
            ORDER BY p.StartTime
        ) cp1
        OUTER APPLY (
            SELECT TOP 1 p.Price
            FROM CourtPriceRules p
            WHERE p.CourtID = @CourtID
              AND p.IsActive = 1
              AND p.SpecificDate IS NULL
              AND p.DayOfWeek = (DATEPART(WEEKDAY, td.TargetDate) - 1)
              AND p.StartTime <= hs.StartTime
              AND p.EndTime >= hs.EndTime
            ORDER BY p.StartTime
        ) cp2
        OUTER APPLY (
            SELECT TOP 1 d.Price
            FROM CourtDefaultPriceRules d
            WHERE d.IsActive = 1
              AND d.IsMapping = 1
              AND d.SpecificDate = td.TargetDate
              AND d.StartTime <= hs.StartTime
              AND d.EndTime >= hs.EndTime
            ORDER BY d.StartTime
        ) dp1
        OUTER APPLY (
            SELECT TOP 1 d.Price
            FROM CourtDefaultPriceRules d
            WHERE d.IsActive = 1
              AND d.IsMapping = 1
              AND d.SpecificDate IS NULL
              AND d.DayOfWeek = (DATEPART(WEEKDAY, td.TargetDate) - 1)
              AND d.StartTime <= hs.StartTime
              AND d.EndTime >= hs.EndTime
            ORDER BY d.StartTime
        ) dp2
        GROUP BY td.TargetDate;

        -- 7. Sinh các ID đặt sân ngẫu nhiên và lưu trữ trước khi chèn (Set-Based)
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

        -- 8. Tính toán lại tổng tiền của cả nhóm nếu không phải giá trọn gói
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
        DROP TABLE #HourlySlots;
        DROP TABLE #BookingPrices;
        DROP TABLE #NewBookings;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        IF @ErrorMessage IS NULL
            SET @ErrorMessage = ERROR_MESSAGE();

        IF OBJECT_ID('tempdb..#HourlySlots') IS NOT NULL DROP TABLE #HourlySlots;
        IF OBJECT_ID('tempdb..#TargetDates') IS NOT NULL DROP TABLE #TargetDates;
        IF OBJECT_ID('tempdb..#BookingPrices') IS NOT NULL DROP TABLE #BookingPrices;
        IF OBJECT_ID('tempdb..#NewBookings') IS NOT NULL DROP TABLE #NewBookings;

        THROW 50000, @ErrorMessage, 1;
    END CATCH;
END;
GO