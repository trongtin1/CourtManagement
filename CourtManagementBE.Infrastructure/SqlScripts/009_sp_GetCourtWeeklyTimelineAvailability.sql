CREATE OR ALTER PROCEDURE dbo.sp_GetCourtWeeklyTimelineAvailability
    @CourtID INT,
    @TargetDate DATE
AS
BEGIN
    SET NOCOUNT ON;
    SET DATEFIRST 7; -- Sunday = 1

    -- 1. Tìm ngày thứ Hai (Monday) của tuần chứa @TargetDate
    DECLARE @targetDow INT = DATEPART(WEEKDAY, @TargetDate);
    DECLARE @daysToMonday INT;
    IF @targetDow = 1 -- Sunday
        SET @daysToMonday = -6;
    ELSE
        SET @daysToMonday = 2 - @targetDow;

    DECLARE @MondayDate DATE = DATEADD(DAY, @daysToMonday, @TargetDate);

    DECLARE @BufferDurationMinutes INT;
    SELECT TOP 1 @BufferDurationMinutes = ISNULL(BufferDurationMinutes, 10) FROM SystemSettings;

    -- 2. Lấy danh sách Giá và Khóa sân từ sp_GetCourtPriceRules
    CREATE TABLE #TempPriceRules (
        CourtPriceRuleID INT NULL,
        CourtID INT,
        PriceRuleTypeID INT NULL,
        DayOfWeek INT NULL,
        SpecificDate DATE NULL,
        StartTime TIME(7),
        EndTime TIME(7),
        Price DECIMAL(18,2),
        IsActive BIT,
        IsLocked BIT,
        LockReason NVARCHAR(500) NULL,
        IsMapping BIT
    );

    INSERT INTO #TempPriceRules
    EXEC dbo.sp_GetCourtPriceRules @CourtID, @TargetDate;

    -- 3. Tạo bảng chứa 7 ngày trong tuần để làm trục thời gian
    CREATE TABLE #WeekDays (
        DayIndex INT, -- 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        SpecificDate DATE
    );

    DECLARE @i INT = 0;
    WHILE @i <= 6
    BEGIN
        DECLARE @diff INT;
        IF @i = 0 -- Sunday
            SET @diff = 6;
        ELSE -- Monday to Saturday
            SET @diff = @i - 1;

        INSERT INTO #WeekDays (DayIndex, SpecificDate)
        VALUES (@i, DATEADD(DAY, @diff, @MondayDate));

        SET @i = @i + 1;
    END;

    -- 4. Trả kết quả dưới dạng JSON hoàn chỉnh
    DECLARE @JsonResult NVARCHAR(MAX);

    SET @JsonResult = (
        SELECT
            wd.DayIndex AS [dayOfWeek],
            CONVERT(VARCHAR(10), wd.SpecificDate, 120) AS [date],

            -- Lấy danh sách bookings hoạt động của ngày này
            JSON_QUERY(ISNULL((
                SELECT
                    b.BookingID AS [bookingID],
                    b.CustomerID AS [customerID],
                    c.CustomerName AS [customerName],
                    c.Phone AS [phone],
                    CONVERT(VARCHAR(5), bs.StartTime, 108) AS [startTime],
                    CONVERT(VARCHAR(5), bs.EndTime, 108) AS [endTime],
                    JSON_QUERY((
                        SELECT 
                            CONVERT(VARCHAR(5), bs.EndTime, 108) AS [startTime],
                            CONVERT(VARCHAR(5), DATEADD(MINUTE, @BufferDurationMinutes, bs.EndTime), 108) AS [endTime]
                        FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
                    )) AS [timeBuffer],
                    b.Status AS [status],
                    b.TotalAmount AS [totalAmount]
                FROM Bookings b
                INNER JOIN BookingSlots bs ON bs.BookingID = b.BookingID
                INNER JOIN Customers c ON c.CustomerID = b.CustomerID
                WHERE b.CourtID = @CourtID
                  AND CAST(b.BookingDate AS DATE) = wd.SpecificDate
                  AND b.Status <> 'cancelled'
                ORDER BY bs.StartTime
                FOR JSON PATH
            ), '[]')) AS [bookings],

            -- Lấy danh sách locks của ngày này (từ #TempPriceRules)
            JSON_QUERY(ISNULL((
                SELECT
                    CONVERT(VARCHAR(5), tp.StartTime, 108) AS [startTime],
                    CONVERT(VARCHAR(5), tp.EndTime, 108) AS [endTime],
                    ISNULL(tp.LockReason, N'Bảo trì') AS [reason]
                FROM #TempPriceRules tp
                WHERE tp.DayOfWeek = wd.DayIndex
                  AND tp.IsLocked = 1
                ORDER BY tp.StartTime
                FOR JSON PATH
            ), '[]')) AS [locks],

            -- Lấy danh sách cấu hình giá (Price Rules/Zones) của ngày này (từ #TempPriceRules)
            JSON_QUERY(ISNULL((
                SELECT
                    CONVERT(VARCHAR(5), tp.StartTime, 108) AS [startTime],
                    CONVERT(VARCHAR(5), tp.EndTime, 108) AS [endTime],
                    tp.Price AS [price]
                FROM #TempPriceRules tp
                WHERE tp.DayOfWeek = wd.DayIndex
                  AND tp.IsLocked = 0
                ORDER BY tp.StartTime
                FOR JSON PATH
            ), '[]')) AS [priceRules]

        FROM #WeekDays wd
        ORDER BY CASE WHEN wd.DayIndex = 0 THEN 7 ELSE wd.DayIndex END
        FOR JSON PATH
    );

    SELECT ISNULL(@JsonResult, '[]') AS JsonResult;

    DROP TABLE #TempPriceRules;
    DROP TABLE #WeekDays;
END;
GO
