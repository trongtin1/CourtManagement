CREATE OR ALTER PROCEDURE dbo.sp_GetAllCourtsSlotAvailability
    @FacilityID INT,
    @TargetDate DATE
AS
BEGIN
    SET NOCOUNT ON;
    SET DATEFIRST 7;

    DECLARE 
        @OpeningTime TIME(7),
        @ClosingTime TIME(7),
        @SlotDurationMinutes INT;

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
    END;

    DECLARE @dow INT = DATEPART(WEEKDAY, @TargetDate) - 1;

    CREATE TABLE #Slots (
        SlotIndex INT IDENTITY(1,1) PRIMARY KEY,
        StartTime TIME(7) NOT NULL,
        EndTime TIME(7) NOT NULL
    );

    DECLARE @current TIME(7) = @OpeningTime;

    WHILE @current < @ClosingTime
    BEGIN
        DECLARE @next TIME(7) = DATEADD(MINUTE, @SlotDurationMinutes, @current);

        IF @next > @ClosingTime
            SET @next = @ClosingTime;

        INSERT INTO #Slots (StartTime, EndTime)
        VALUES (@current, @next);

        SET @current = @next;
    END;

    CREATE TABLE #Courts (
        CourtID INT PRIMARY KEY,
        CourtName NVARCHAR(200),
        CourtCode NVARCHAR(50),
        CourtType NVARCHAR(100)
    );

    INSERT INTO #Courts (CourtID, CourtName, CourtCode, CourtType)
    SELECT
        c.CourtID,
        c.CourtName,
        c.CourtCode,
        ISNULL(ct.Name, N'Sân thể thao') AS CourtType
    FROM Courts c
    LEFT JOIN CourtTypes ct ON ct.CourtTypeID = c.CourtTypeID
    WHERE c.FacilityID = @FacilityID
      AND c.IsActive = 1;

    CREATE TABLE #Result (
        CourtID INT NOT NULL,
        CourtName NVARCHAR(200),
        CourtCode NVARCHAR(50),
        SlotIndex INT NOT NULL,
        StartTime TIME(7) NOT NULL,
        EndTime TIME(7) NOT NULL,
        Price DECIMAL(18,2) DEFAULT 0,
        IsLocked BIT DEFAULT 0,
        LockReason NVARCHAR(500) NULL,
        IsBooked BIT DEFAULT 0,
        BookingID UNIQUEIDENTIFIER NULL,
        CustomerID INT NULL,
        CustomerName NVARCHAR(200) NULL,
        Phone NVARCHAR(50) NULL,
        CustomerType NVARCHAR(50) NULL,
        BookingStatus NVARCHAR(50) NULL,
        TotalAmount DECIMAL(18,2) DEFAULT 0
    );

    INSERT INTO #Result (
        CourtID, CourtName, CourtCode,
        SlotIndex, StartTime, EndTime
    )
    SELECT
        c.CourtID,
        c.CourtName,
        c.CourtCode,
        s.SlotIndex,
        s.StartTime,
        s.EndTime
    FROM #Courts c
    CROSS JOIN #Slots s;

    CREATE INDEX IX_Result_Court_Slot
    ON #Result (CourtID, SlotIndex, StartTime, EndTime);

    CREATE INDEX IX_Result_Available
    ON #Result (CourtID, IsBooked, IsLocked, Price, SlotIndex);

    CREATE INDEX IX_Result_Booking
    ON #Result (CourtID, BookingID);

    UPDATE r
    SET r.Price = ISNULL(priceRule.Price, 0)
    FROM #Result r
    OUTER APPLY (
        SELECT TOP 1 x.Price
        FROM (
            SELECT d.Price, 1 AS Priority, d.StartTime
            FROM CourtDefaultPriceRules d
            WHERE d.IsActive = 1
              AND d.IsMapping = 1
              AND d.SpecificDate = @TargetDate
              AND d.StartTime <= r.StartTime
              AND d.EndTime >= r.EndTime

            UNION ALL

            SELECT d.Price, 2 AS Priority, d.StartTime
            FROM CourtDefaultPriceRules d
            WHERE d.IsActive = 1
              AND d.IsMapping = 1
              AND d.SpecificDate IS NULL
              AND d.DayOfWeek = @dow
              AND d.StartTime <= r.StartTime
              AND d.EndTime >= r.EndTime

            UNION ALL

            SELECT p.Price, 3 AS Priority, p.StartTime
            FROM CourtPriceRules p
            WHERE p.CourtID = r.CourtID
              AND p.IsActive = 1
              AND p.SpecificDate = @TargetDate
              AND p.StartTime <= r.StartTime
              AND p.EndTime >= r.EndTime

            UNION ALL

            SELECT p.Price, 4 AS Priority, p.StartTime
            FROM CourtPriceRules p
            WHERE p.CourtID = r.CourtID
              AND p.IsActive = 1
              AND p.SpecificDate IS NULL
              AND p.DayOfWeek = @dow
              AND p.StartTime <= r.StartTime
              AND p.EndTime >= r.EndTime
        ) x
        ORDER BY x.Priority, x.StartTime
    ) priceRule;

    UPDATE r
    SET 
        r.IsLocked = 1,
        r.LockReason = l.LockReason
    FROM #Result r
    INNER JOIN CourtLockedSlots l 
        ON l.CourtID = r.CourtID
       AND l.IsActive = 1
    WHERE (
            (l.IsWeekly = 0 AND l.SpecificDate = @TargetDate)
         OR (l.IsWeekly = 1 AND l.DayOfWeek = @dow)
    )
    AND (
            l.IsAllDay = 1
         OR (l.StartTime < r.EndTime AND l.EndTime > r.StartTime)
    );

    UPDATE r
    SET 
        r.IsBooked = 1,
        r.BookingID = b.BookingID,
        r.CustomerID = b.CustomerID,
        r.CustomerName = cust.CustomerName,
        r.Phone = cust.Phone,
        r.CustomerType = cust.CustomerType,
        r.BookingStatus = b.Status,
        r.TotalAmount = b.TotalAmount
    FROM #Result r
    INNER JOIN BookingSlots bs 
        ON bs.CourtID = r.CourtID
       AND bs.BookingDate = @TargetDate
    INNER JOIN Bookings b 
        ON b.BookingID = bs.BookingID
    INNER JOIN Customers cust 
        ON cust.CustomerID = b.CustomerID
    WHERE b.Status NOT IN ('cancelled')
      AND bs.StartTime < r.EndTime
      AND bs.EndTime > r.StartTime;

    DECLARE @JsonResult NVARCHAR(MAX);

    SET @JsonResult = (
        SELECT
            c.CourtID AS [courtID],
            c.CourtName AS [courtName],
            c.CourtCode AS [courtCode],
            c.CourtType AS [courtType],

            JSON_QUERY(ISNULL((
                SELECT
                    b.BookingID AS [bookingID],
                    c.CourtID AS [courtID],
                    b.CustomerID AS [customerID],
                    CONVERT(VARCHAR(10), @TargetDate, 120) AS [bookingDate],
                    b.TotalAmount AS [totalAmount],
                    b.Status AS [status],
                    ISNULL(b.Note, N'') AS [note],

                    JSON_QUERY((
                        SELECT
                            cust.CustomerID AS [customerID],
                            cust.CustomerName AS [customerName],
                            cust.Phone AS [phone],
                            cust.CustomerType AS [customerType],
                            ISNULL(cust.Email, N'') AS [email]
                        FROM Customers cust
                        WHERE cust.CustomerID = b.CustomerID
                        FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
                    )) AS [customer],

                    JSON_QUERY((
                        SELECT
                            r2.SlotIndex AS [timeSlotID],
                            CONVERT(VARCHAR(5), r2.StartTime, 108) AS [startTime],
                            CONVERT(VARCHAR(5), r2.EndTime, 108) AS [endTime],
                            r2.Price AS [price]
                        FROM #Result r2
                        WHERE r2.CourtID = c.CourtID
                          AND r2.BookingID = b.BookingID
                        ORDER BY r2.StartTime
                        FOR JSON PATH
                    )) AS [slots]

                FROM (
                    SELECT DISTINCT BookingID
                    FROM #Result
                    WHERE CourtID = c.CourtID
                      AND IsBooked = 1
                      AND BookingID IS NOT NULL
                ) rb
                INNER JOIN Bookings b ON b.BookingID = rb.BookingID
                FOR JSON PATH
            ), '[]')) AS [bookings],

            JSON_QUERY(ISNULL((
                SELECT
                    l.CourtID AS [courtID],
                    CONVERT(VARCHAR(5),
                        CASE
                            WHEN l.IsAllDay = 1 THEN @OpeningTime
                            WHEN l.StartTime < @OpeningTime THEN @OpeningTime
                            ELSE l.StartTime
                        END, 108
                    ) AS [startTime],
                    CONVERT(VARCHAR(5),
                        CASE
                            WHEN l.IsAllDay = 1 THEN @ClosingTime
                            WHEN l.EndTime > @ClosingTime THEN @ClosingTime
                            ELSE l.EndTime
                        END, 108
                    ) AS [endTime],
                    ISNULL(l.LockReason, N'Bảo trì') AS [reason],
                    CONVERT(VARCHAR(10), @TargetDate, 120) AS [date]
                FROM CourtLockedSlots l
                WHERE l.CourtID = c.CourtID
                  AND l.IsActive = 1
                  AND (
                        (l.IsWeekly = 0 AND l.SpecificDate = @TargetDate)
                     OR (l.IsWeekly = 1 AND l.DayOfWeek = @dow)
                  )
                  AND (
                        l.IsAllDay = 1
                     OR (l.StartTime < @ClosingTime AND l.EndTime > @OpeningTime)
                  )
                ORDER BY l.StartTime
                FOR JSON PATH
            ), '[]')) AS [locks],

            JSON_QUERY(ISNULL((
                SELECT
                    MIN(x.SlotIndex) AS [timeSlotID],
                    CONVERT(VARCHAR(5), MIN(x.StartTime), 108) AS [startTime],
                    CONVERT(VARCHAR(5), MAX(x.EndTime), 108) AS [endTime],
                    x.Price AS [price]
                FROM (
                    SELECT
                        r4.SlotIndex,
                        r4.StartTime,
                        r4.EndTime,
                        r4.Price,
                        r4.SlotIndex 
                            - ROW_NUMBER() OVER (
                                PARTITION BY r4.Price
                                ORDER BY r4.SlotIndex
                            ) AS GroupID
                    FROM #Result r4
                    WHERE r4.CourtID = c.CourtID
                      AND r4.IsBooked = 0
                      AND r4.IsLocked = 0
                ) x
                GROUP BY x.Price, x.GroupID
                ORDER BY MIN(x.StartTime)
                FOR JSON PATH
            ), '[]')) AS [availableSlots]

        FROM #Courts c
        ORDER BY c.CourtID
        FOR JSON PATH
    );

    SELECT ISNULL(@JsonResult, '[]') AS JsonResult;

    DROP TABLE IF EXISTS #Result;
    DROP TABLE IF EXISTS #Courts;
    DROP TABLE IF EXISTS #Slots;
END;
GO