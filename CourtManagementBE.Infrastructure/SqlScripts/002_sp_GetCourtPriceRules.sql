CREATE OR ALTER PROCEDURE dbo.sp_GetCourtPriceRules
    @CourtID INT,
    @TargetDate DATE
AS
BEGIN
    SET NOCOUNT ON;
    SET DATEFIRST 7; -- Sunday = 1 => DATEPART(WEEKDAY) - 1 = 0 (match C# DayOfWeek)

    -- Tìm ngày thứ Hai (Monday) của tuần chứa @TargetDate
    DECLARE @targetDow INT = DATEPART(WEEKDAY, @TargetDate);
    DECLARE @daysToMonday INT;
    IF @targetDow = 1 -- Sunday
        SET @daysToMonday = -6;
    ELSE
        SET @daysToMonday = 2 - @targetDow;

    DECLARE @MondayDate DATE = DATEADD(DAY, @daysToMonday, @TargetDate);

    -- Final result
    CREATE TABLE #Result (
        CourtPriceRuleID INT NULL,
        CourtID INT,
        PriceRuleTypeID INT NULL,
        DayOfWeek INT NULL,
        SpecificDate DATE NULL,
        StartTime TIME(7),
        EndTime TIME(7),
        Price DECIMAL(18,2),
        IsActive BIT,
        IsLocked BIT DEFAULT 0,
        LockReason NVARCHAR(500) NULL,
        IsMapping BIT DEFAULT 0
    );

    DECLARE @day INT = 0;
    WHILE @day <= 6
    BEGIN
        -- Tính ngày cụ thể cho @day (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
        -- dựa trên ngày thứ Hai đầu tuần (@MondayDate)
        DECLARE @diff INT;
        IF @day = 0 -- Sunday
            SET @diff = 6;
        ELSE -- Monday to Saturday
            SET @diff = @day - 1;

        DECLARE @specificDate DATE = DATEADD(DAY, @diff, @MondayDate);

        -- ══════════════════════════════════════════════
        -- BASE: Court custom rules hoặc Fallback Default
        -- ══════════════════════════════════════════════
        CREATE TABLE #Base (
            SourceID INT,
            PriceRuleTypeID INT NULL,
            StartTime TIME(7),
            EndTime TIME(7),
            Price DECIMAL(18,2),
            IsDefault BIT,
            DayOfWeek INT NULL,
            SpecificDate DATE NULL
        );

        -- 1. ƯU TIÊN 1: Cấu hình riêng của Sân cho Ngày Cụ Thể
        IF EXISTS (
            SELECT 1 FROM CourtPriceRules 
            WHERE CourtID = @CourtID AND IsActive = 1 AND SpecificDate = @specificDate
        )
        BEGIN
            INSERT INTO #Base (SourceID, PriceRuleTypeID, StartTime, EndTime, Price, IsDefault, DayOfWeek, SpecificDate)
            SELECT CourtPriceRuleID, PriceRuleTypeID, StartTime, EndTime, Price, 0, NULL, SpecificDate
            FROM CourtPriceRules
            WHERE CourtID = @CourtID AND IsActive = 1 AND SpecificDate = @specificDate;
        END
        -- 2. ƯU TIÊN 2: Cấu hình riêng của Sân cho Thứ trong tuần
        ELSE IF EXISTS (
            SELECT 1 FROM CourtPriceRules 
            WHERE CourtID = @CourtID AND IsActive = 1 AND DayOfWeek = @day AND SpecificDate IS NULL
        )
        BEGIN
            INSERT INTO #Base (SourceID, PriceRuleTypeID, StartTime, EndTime, Price, IsDefault, DayOfWeek, SpecificDate)
            SELECT CourtPriceRuleID, PriceRuleTypeID, StartTime, EndTime, Price, 0, DayOfWeek, NULL
            FROM CourtPriceRules
            WHERE CourtID = @CourtID AND IsActive = 1 AND DayOfWeek = @day AND SpecificDate IS NULL;
        END
        -- -- 3. FALLBACK 1: Cấu hình Mặc định của Hệ thống cho Ngày Cụ Thể
        -- ELSE IF EXISTS (
        --     SELECT 1 FROM CourtDefaultPriceRules 
        --     WHERE IsActive = 1 AND IsLoadDefault = 1 AND SpecificDate = @specificDate
        -- )
        -- BEGIN
        --     INSERT INTO #Base (SourceID, PriceRuleTypeID, StartTime, EndTime, Price, IsDefault, DayOfWeek, SpecificDate)
        --     SELECT CourtDefaultPriceRuleID, PriceRuleTypeID, StartTime, EndTime, Price, 1, NULL, @specificDate
        --     FROM CourtDefaultPriceRules
        --     WHERE IsActive = 1 AND IsLoadDefault = 1 AND SpecificDate = @specificDate;
        -- END
        -- -- 4. FALLBACK 2: Cấu hình Mặc định của Hệ thống cho Thứ trong tuần
        -- ELSE
        -- BEGIN
        --     INSERT INTO #Base (SourceID, PriceRuleTypeID, StartTime, EndTime, Price, IsDefault, DayOfWeek, SpecificDate)
        --     SELECT CourtDefaultPriceRuleID, PriceRuleTypeID, StartTime, EndTime, Price, 1, @day, NULL
        --     FROM CourtDefaultPriceRules
        --     WHERE IsActive = 1 AND IsLoadDefault = 1 AND DayOfWeek = @day AND SpecificDate IS NULL;
        -- END

        -- ══════════════════════════════════════════════
        -- OVERLAY: System defaults có IsMapping = 1
        -- Ưu tiên 1: SpecificDate, Ưu tiên 2: DayOfWeek
        -- ══════════════════════════════════════════════
        CREATE TABLE #Overlays (
            SourceID INT,
            PriceRuleTypeID INT NULL,
            StartTime TIME(7),
            EndTime TIME(7),
            Price DECIMAL(18,2)
        );

        DECLARE @hasSpecific BIT = 0;
        IF EXISTS (
            SELECT 1 FROM CourtDefaultPriceRules
                        WHERE IsActive = 1 AND IsMapping = 1 AND SpecificDate = @specificDate
        )
            SET @hasSpecific = 1;

        IF @hasSpecific = 1
        BEGIN
            INSERT INTO #Overlays (SourceID, PriceRuleTypeID, StartTime, EndTime, Price)
                        SELECT d.CourtDefaultPriceRuleID, d.PriceRuleTypeID, d.StartTime, d.EndTime, d.Price
                        FROM CourtDefaultPriceRules d
            WHERE d.IsActive = 1
                            AND d.IsMapping = 1
                            AND d.SpecificDate = @specificDate;
        END
        ELSE
        BEGIN
            INSERT INTO #Overlays (SourceID, PriceRuleTypeID, StartTime, EndTime, Price)
                        SELECT d.CourtDefaultPriceRuleID, d.PriceRuleTypeID, d.StartTime, d.EndTime, d.Price
                        FROM CourtDefaultPriceRules d
            WHERE d.IsActive = 1
                            AND d.IsMapping = 1
              AND d.SpecificDate IS NULL
                            AND d.DayOfWeek = @day;
        END

        -- ══════════════════════════════════════════════
        -- Thuật toán Overlay: đè từng khung system lên base
        -- ══════════════════════════════════════════════
        DECLARE @oSrc INT, @oPrt INT, @oStart TIME(7), @oEnd TIME(7), @oPrice DECIMAL(18,2);

        DECLARE cur CURSOR LOCAL FAST_FORWARD FOR
            SELECT SourceID, PriceRuleTypeID, StartTime, EndTime, Price
            FROM #Overlays ORDER BY StartTime;

        OPEN cur;
        FETCH NEXT FROM cur INTO @oSrc, @oPrt, @oStart, @oEnd, @oPrice;

        WHILE @@FETCH_STATUS = 0
        BEGIN
            CREATE TABLE #NewBase (
                SourceID INT,
                PriceRuleTypeID INT NULL,
                StartTime TIME(7),
                EndTime TIME(7),
                Price DECIMAL(18,2),
                IsDefault BIT,
                DayOfWeek INT NULL,
                SpecificDate DATE NULL
            );

            -- Case 1: Không trùng lấn → giữ nguyên
            INSERT INTO #NewBase
            SELECT SourceID, PriceRuleTypeID, StartTime, EndTime, Price, IsDefault, DayOfWeek, SpecificDate
            FROM #Base
            WHERE EndTime <= @oStart OR StartTime >= @oEnd;

            -- Case 2: Trùng hoàn toàn (base nằm trọn trong overlay) → bỏ qua

            -- Case 3: Trùng bên trái → cắt đuôi base
            INSERT INTO #NewBase
            SELECT SourceID, PriceRuleTypeID, StartTime, @oStart, Price, IsDefault, DayOfWeek, SpecificDate
            FROM #Base
            WHERE StartTime < @oStart AND EndTime > @oStart AND EndTime <= @oEnd;

            -- Case 4: Trùng bên phải → cắt đầu base
            INSERT INTO #NewBase
            SELECT SourceID, PriceRuleTypeID, @oEnd, EndTime, Price, IsDefault, DayOfWeek, SpecificDate
            FROM #Base
            WHERE StartTime >= @oStart AND StartTime < @oEnd AND EndTime > @oEnd;

            -- Case 5: Overlay nằm giữa base → tách đôi base
            INSERT INTO #NewBase
            SELECT SourceID, PriceRuleTypeID, StartTime, @oStart, Price, IsDefault, DayOfWeek, SpecificDate
            FROM #Base
            WHERE StartTime < @oStart AND EndTime > @oEnd;

            INSERT INTO #NewBase
            SELECT SourceID, PriceRuleTypeID, @oEnd, EndTime, Price, IsDefault, DayOfWeek, SpecificDate
            FROM #Base
            WHERE StartTime < @oStart AND EndTime > @oEnd;

            -- Chèn overlay vào kết quả
            INSERT INTO #NewBase VALUES (-@oSrc, @oPrt, @oStart, @oEnd, @oPrice, 1, @day, NULL);

            -- Thay thế base bằng kết quả mới
            DELETE FROM #Base;
            INSERT INTO #Base SELECT * FROM #NewBase;
            DROP TABLE #NewBase;

            FETCH NEXT FROM cur INTO @oSrc, @oPrt, @oStart, @oEnd, @oPrice;
        END

        CLOSE cur;
        DEALLOCATE cur;

        -- Đưa kết quả ngày này vào bảng tổng
        INSERT INTO #Result (CourtPriceRuleID, CourtID, PriceRuleTypeID, DayOfWeek, SpecificDate, StartTime, EndTime, Price, IsActive, IsMapping)
        SELECT 
            CASE WHEN IsDefault = 1 THEN NULL ELSE SourceID END, 
            @CourtID, 
            PriceRuleTypeID, 
            DayOfWeek, 
            SpecificDate, 
            StartTime, 
            EndTime, 
            Price, 
            1, 
            IsDefault
        FROM #Base;

        -- Chèn các locked slots của ngày này vào #Result
        INSERT INTO #Result (CourtPriceRuleID, CourtID, PriceRuleTypeID, DayOfWeek, SpecificDate, StartTime, EndTime, Price, IsActive, IsLocked, LockReason, IsMapping)
        SELECT 
            NULL,
            @CourtID,
            NULL,
            @day,
            @specificDate,
            l.StartTime,
            l.EndTime,
            0,
            1,
            1,
            l.LockReason,
            0
        FROM CourtLockedSlots l
        WHERE l.CourtID = @CourtID AND l.IsActive = 1
          AND (
              (l.IsWeekly = 0 AND l.SpecificDate = @specificDate)
              OR
              (l.IsWeekly = 1 AND l.DayOfWeek = @day)
          );

        DROP TABLE #Base;
        DROP TABLE #Overlays;

        SET @day = @day + 1;
    END

    -- Cập nhật thông tin khóa sân (Locked Slots)
    UPDATE r
    SET 
        r.IsLocked = 1,
        r.LockReason = l.LockReason
    FROM #Result r
    INNER JOIN CourtLockedSlots l ON l.CourtID = r.CourtID AND l.IsActive = 1
    WHERE 
        (
            (l.IsWeekly = 0 AND l.SpecificDate = COALESCE(r.SpecificDate, DATEADD(DAY, CASE WHEN r.DayOfWeek = 0 THEN 6 ELSE r.DayOfWeek - 1 END, @MondayDate)))
            OR
            (l.IsWeekly = 1 AND l.DayOfWeek = r.DayOfWeek)
        )
        AND l.StartTime < r.EndTime
        AND l.EndTime > r.StartTime;

    -- Trả kết quả cuối cùng đã sắp xếp
    SELECT 
        CourtPriceRuleID, 
        CourtID, 
        PriceRuleTypeID, 
        DayOfWeek, 
        SpecificDate, 
        StartTime, 
        EndTime, 
        Price, 
        IsActive,
        IsLocked,
        LockReason,
        IsMapping
    FROM #Result
    ORDER BY DayOfWeek, StartTime;

    DROP TABLE #Result;
END
GO
