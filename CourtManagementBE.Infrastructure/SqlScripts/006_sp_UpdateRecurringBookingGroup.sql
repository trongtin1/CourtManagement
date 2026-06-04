CREATE OR ALTER PROCEDURE dbo.sp_UpdateRecurringBookingGroup
    @BookingGroupID INT,
    @CustomerID INT,
    @FacilityID INT,
    @CourtID INT,
    @StartDate DATE,
    @EndDate DATE,
    @StartTime TIME(7),
    @EndTime TIME(7),
    @DaysOfWeek NVARCHAR(100),
    @ModifiedBy NVARCHAR(100),
    @Note NVARCHAR(MAX),
    @FlatRatePrice DECIMAL(18,2) = NULL,
    @ErrorMessage NVARCHAR(MAX) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
    SET DATEFIRST 7;

    SET @ErrorMessage = NULL;
    DECLARE @Today DATE = CAST(SYSDATETIMEOFFSET() AT TIME ZONE 'SE Asia Standard Time' AS DATE);
    DECLARE @BufferDurationMinutes INT = 10;

    SELECT TOP 1 
        @BufferDurationMinutes = ISNULL(BufferDurationMinutes, 10)
    FROM SystemSettings;

    BEGIN TRY
        BEGIN TRANSACTION;

        -- 1. Cập nhật thông tin chung của Booking Group
        UPDATE BookingGroups
        SET CustomerID = @CustomerID,
            Note = ISNULL(@Note, ''),
            TotalAmount = CASE WHEN @FlatRatePrice IS NOT NULL AND @FlatRatePrice > 0 THEN @FlatRatePrice ELSE TotalAmount END,
            ModifiedDate = SYSDATETIMEOFFSET(),
            ModifiedBy = @ModifiedBy
        WHERE BookingGroupID = @BookingGroupID;

        -- 2. Cập nhật cấu hình lặp Recurring Configs
        UPDATE RecurringConfigs
        SET CourtID = @CourtID,
            StartDate = @StartDate,
            EndDate = @EndDate,
            StartTime = @StartTime,
            EndTime = @EndTime,
            DaysOfWeek = @DaysOfWeek
        WHERE BookingGroupID = @BookingGroupID;

        -- 3. Chuyển toàn bộ booking tương lai  của nhóm này về trạng thái Hủy
        CREATE TABLE #FutureBookingsToCancel (
            BookingID UNIQUEIDENTIFIER NOT NULL
        );

        INSERT INTO #FutureBookingsToCancel (BookingID)
        SELECT BookingID
        FROM Bookings
        WHERE BookingGroupID = @BookingGroupID
          AND BookingDate >= @Today
          AND Status <> 'cancelled'
          AND Status <> 'completed';

        -- Chuyển trạng thái booking sang cancelled
        UPDATE Bookings
        SET Status = 'cancelled',
            CancellationReason = N'Thay đổi lịch trình nhóm định kỳ',
            ModifiedDate = SYSDATETIMEOFFSET(),
            ModifiedBy = @ModifiedBy
        WHERE BookingID IN (SELECT BookingID FROM #FutureBookingsToCancel);

        -- Giải phóng slots của các booking bị hủy để trống lịch cho khung giờ mới
        DELETE FROM BookingSlots
        WHERE BookingID IN (SELECT BookingID FROM #FutureBookingsToCancel);

        DROP TABLE #FutureBookingsToCancel;

        -- 4. Xác định danh sách các ngày chơi mới trong tương lai
        CREATE TABLE #TargetDates (
            TargetDate DATE NOT NULL
        );

        DECLARE @StartCursor DATE = CASE WHEN @StartDate > @Today THEN @StartDate ELSE @Today END;
        DECLARE @Cursor DATE = @StartCursor;

        WHILE @Cursor <= @EndDate
        BEGIN
            DECLARE @dow INT = (DATEPART(WEEKDAY, @Cursor) + @@DATEFIRST - 1) % 7;

            IF CHARINDEX(',' + CAST(@dow AS VARCHAR(10)) + ',', ',' + REPLACE(@DaysOfWeek, ' ', '') + ',') > 0
            BEGIN
                INSERT INTO #TargetDates (TargetDate)
                VALUES (@Cursor);
            END

            SET @Cursor = DATEADD(DAY, 1, @Cursor);
        END;

        -- Loại bỏ các ngày đã có booking hoạt động (không bị hủy) sẵn của nhóm này (past hoặc paid đã được giữ lại)
        DELETE td
        FROM #TargetDates td
        WHERE EXISTS (
            SELECT 1
            FROM Bookings b
            WHERE b.BookingGroupID = @BookingGroupID
              AND b.BookingDate = td.TargetDate
              AND b.Status <> 'cancelled'
        );

        -- 5. Kiểm tra trùng lịch của khung giờ mới trên sân đấu mới
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

        -- 6. Tính giá tự động cho toàn bộ danh sách ngày lặp mới bằng cách tính tỷ lệ theo phút (pro-rated) dựa trên Price Rules
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
            @ModifiedBy, 
            SYSDATETIMEOFFSET(), 
            @ModifiedBy
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

        -- 8. Tính toán lại tổng tiền của cả nhóm dựa trên tất cả các buổi (cũ + mới) không bị hủy nếu không phải giá trọn gói
        IF @FlatRatePrice IS NULL OR @FlatRatePrice <= 0
        BEGIN
            DECLARE @TotalGroupAmount DECIMAL(18,2) = 0;

            SELECT @TotalGroupAmount = ISNULL(SUM(TotalAmount), 0)
            FROM Bookings
            WHERE BookingGroupID = @BookingGroupID
              AND Status <> 'cancelled';

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
