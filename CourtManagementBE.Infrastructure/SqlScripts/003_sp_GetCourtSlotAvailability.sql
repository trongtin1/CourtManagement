CREATE OR ALTER PROCEDURE dbo.sp_GetCourtSlotAvailability
    @CourtID INT,
    @TargetDate DATE
AS
BEGIN
    SET NOCOUNT ON;
    SET DATEFIRST 7; -- Sunday = 1

    -- ══════════════════════════════════════════════════════════════════════
    -- 1. Xác định giờ mở/đóng cửa và slot duration từ SystemSettings
    -- ══════════════════════════════════════════════════════════════════════
    DECLARE @OpeningTime TIME(7), @ClosingTime TIME(7), @SlotDurationMinutes INT;

    SELECT TOP 1 
        @OpeningTime = OpeningTime, 
        @ClosingTime = ClosingTime,
        @SlotDurationMinutes = ISNULL(SlotDurationMinutes, 60)
    FROM SystemSettings;

    IF @OpeningTime IS NULL
    BEGIN
        SET @OpeningTime = '06:00:00';
        SET @ClosingTime = '22:00:00';
        SET @SlotDurationMinutes = 60;
    END

    -- ══════════════════════════════════════════════════════════════════════
    -- 2. Sinh danh sách khung giờ từ OpeningTime → ClosingTime
    -- ══════════════════════════════════════════════════════════════════════
    CREATE TABLE #Slots (
        SlotIndex   INT IDENTITY(1,1),
        StartTime   TIME(7),
        EndTime     TIME(7)
    );

    DECLARE @current TIME(7) = @OpeningTime;
    WHILE @current < @ClosingTime
    BEGIN
        DECLARE @next TIME(7) = DATEADD(MINUTE, @SlotDurationMinutes, @current);
        IF @next > @ClosingTime
            SET @next = @ClosingTime;

        INSERT INTO #Slots (StartTime, EndTime) VALUES (@current, @next);
        SET @current = @next;
    END

    -- ══════════════════════════════════════════════════════════════════════
    -- 3. Tính DayOfWeek theo C# convention (0 = Sunday ... 6 = Saturday)
    -- ══════════════════════════════════════════════════════════════════════
    DECLARE @dow INT = DATEPART(WEEKDAY, @TargetDate) - 1; -- DATEFIRST 7 => Sunday=1 => -1 => 0=Sunday

    -- ══════════════════════════════════════════════════════════════════════
    -- 4. Lấy giá cho từng slot từ CourtPriceRules
    --    Ưu tiên: SpecificDate > DayOfWeek
    -- ══════════════════════════════════════════════════════════════════════
    CREATE TABLE #SlotPrices (
        SlotIndex   INT,
        StartTime   TIME(7),
        EndTime     TIME(7),
        Price       DECIMAL(18,2) DEFAULT 0,
        IsLocked    BIT DEFAULT 0,
        IsBooked    BIT DEFAULT 0,
        LockReason  NVARCHAR(500) NULL
    );

    INSERT INTO #SlotPrices (SlotIndex, StartTime, EndTime, Price)
    SELECT
        s.SlotIndex,
        s.StartTime,
        s.EndTime,
        ISNULL((
            -- Ưu tiên 1: Giá theo SpecificDate
            SELECT TOP 1 p.Price
            FROM CourtPriceRules p
            WHERE p.CourtID = @CourtID
              AND p.IsActive = 1
              AND p.SpecificDate = @TargetDate
              AND p.StartTime <= s.StartTime
              AND p.EndTime >= s.EndTime
            ORDER BY p.StartTime
        ), ISNULL((
            -- Ưu tiên 2: Giá theo DayOfWeek
            SELECT TOP 1 p.Price
            FROM CourtPriceRules p
            WHERE p.CourtID = @CourtID
              AND p.IsActive = 1
              AND p.SpecificDate IS NULL
              AND p.DayOfWeek = @dow
              AND p.StartTime <= s.StartTime
              AND p.EndTime >= s.EndTime
            ORDER BY p.StartTime
        ), ISNULL((
            -- Fallback: Default Price Rules (IsMapping overlay) theo SpecificDate
            SELECT TOP 1 d.Price
            FROM CourtDefaultPriceRules d
            WHERE d.IsActive = 1
              AND d.IsMapping = 1
              AND d.SpecificDate = @TargetDate
              AND d.StartTime <= s.StartTime
              AND d.EndTime >= s.EndTime
            ORDER BY d.StartTime
        ), ISNULL((
            -- Fallback: Default Price Rules (IsMapping overlay) theo DayOfWeek
            SELECT TOP 1 d.Price
            FROM CourtDefaultPriceRules d
            WHERE d.IsActive = 1
              AND d.IsMapping = 1
              AND d.SpecificDate IS NULL
              AND d.DayOfWeek = @dow
              AND d.StartTime <= s.StartTime
              AND d.EndTime >= s.EndTime
            ORDER BY d.StartTime
        ), 0))))
    FROM #Slots s;

    -- ══════════════════════════════════════════════════════════════════════
    -- 5. Đánh dấu slot bị khóa (CourtLockedSlots)
    -- ══════════════════════════════════════════════════════════════════════
    UPDATE sp
    SET
        sp.IsLocked = 1,
        sp.LockReason = l.LockReason
    FROM #SlotPrices sp
    INNER JOIN CourtLockedSlots l ON l.CourtID = @CourtID AND l.IsActive = 1
    WHERE
        (
            -- Khóa theo ngày cụ thể
            (l.IsWeekly = 0 AND l.SpecificDate = @TargetDate)
            OR
            -- Khóa hàng tuần theo thứ
            (l.IsWeekly = 1 AND l.DayOfWeek = @dow)
        )
        AND (
            -- Khóa cả ngày
            l.IsAllDay = 1
            OR
            -- Khóa theo khung giờ (overlap check)
            (l.StartTime < sp.EndTime AND l.EndTime > sp.StartTime)
        );

    -- ══════════════════════════════════════════════════════════════════════
    -- 6. Đánh dấu slot đã được đặt (BookingSlots + Bookings status check)
    -- ══════════════════════════════════════════════════════════════════════
    UPDATE sp
    SET sp.IsBooked = 1
    FROM #SlotPrices sp
    WHERE EXISTS (
        SELECT 1
        FROM BookingSlots bs
        INNER JOIN Bookings b ON b.BookingID = bs.BookingID
        WHERE bs.CourtID = @CourtID
          AND bs.BookingDate = @TargetDate
          AND b.Status NOT IN ('cancelled')
          AND bs.StartTime < sp.EndTime
          AND bs.EndTime > sp.StartTime
    );

    -- ══════════════════════════════════════════════════════════════════════
    -- 7. Trả kết quả
    -- ══════════════════════════════════════════════════════════════════════
    SELECT
        sp.SlotIndex,
        CONVERT(VARCHAR(8), sp.StartTime, 108) AS StartTime,
        CONVERT(VARCHAR(8), sp.EndTime, 108)   AS EndTime,
        sp.Price,
        sp.IsLocked,
        sp.IsBooked,
        sp.LockReason
    FROM #SlotPrices sp
    ORDER BY sp.SlotIndex;

    DROP TABLE #Slots;
    DROP TABLE #SlotPrices;
END
GO
