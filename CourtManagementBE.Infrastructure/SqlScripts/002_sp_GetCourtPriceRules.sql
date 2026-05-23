CREATE OR ALTER PROCEDURE dbo.sp_GetCourtPriceRules
    @CourtID INT,
    @TargetDate DATE
AS
BEGIN
    SET NOCOUNT ON;
    SET DATEFIRST 7; -- Sunday = 1 => DATEPART(WEEKDAY) - 1 = 0 (match C# DayOfWeek)

    -- Final result
    CREATE TABLE #Result (
        CourtPriceRuleID INT,
        CourtID INT,
        PriceRuleTypeID INT NULL,
        DayOfWeek INT NULL,
        SpecificDate DATE NULL,
        StartTime TIME(7),
        EndTime TIME(7),
        Price DECIMAL(18,2),
        IsActive BIT
    );

    DECLARE @day INT = 0;
    WHILE @day <= 6
    BEGIN
        -- Tính ngày cụ thể cho @day dựa trên @TargetDate
        DECLARE @targetDow INT = DATEPART(WEEKDAY, @TargetDate) - 1;
        DECLARE @diff INT = @day - @targetDow;
        DECLARE @specificDate DATE = DATEADD(DAY, @diff, @TargetDate);

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
        --     WHERE IsActive = 1 AND SpecificDate = @specificDate
        -- )
        -- BEGIN
        --     INSERT INTO #Base (SourceID, PriceRuleTypeID, StartTime, EndTime, Price, IsDefault, DayOfWeek, SpecificDate)
        --     SELECT CourtDefaultPriceRuleID, PriceRuleTypeID, StartTime, EndTime, Price, 1, NULL, @specificDate
        --     FROM CourtDefaultPriceRules
        --     WHERE IsActive = 1 AND SpecificDate = @specificDate;
        -- END
        -- -- 4. FALLBACK 2: Cấu hình Mặc định của Hệ thống cho Thứ trong tuần
        -- ELSE
        -- BEGIN
        --     INSERT INTO #Base (SourceID, PriceRuleTypeID, StartTime, EndTime, Price, IsDefault, DayOfWeek, SpecificDate)
        --     SELECT CourtDefaultPriceRuleID, PriceRuleTypeID, StartTime, EndTime, Price, 1, @day, NULL
        --     FROM CourtDefaultPriceRules
        --     WHERE IsActive = 1 AND DayOfWeek = @day AND SpecificDate IS NULL;
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
            WHERE IsActive = 1 AND SpecificDate = @specificDate
        )
            SET @hasSpecific = 1;

        IF @hasSpecific = 1
        BEGIN
            INSERT INTO #Overlays (SourceID, PriceRuleTypeID, StartTime, EndTime, Price)
            SELECT d.CourtDefaultPriceRuleID, d.PriceRuleTypeID, d.StartTime, d.EndTime, d.Price
            FROM CourtDefaultPriceRules d
            LEFT JOIN PriceRuleTypes p ON d.PriceRuleTypeID = p.PriceRuleTypeID
            WHERE d.IsActive = 1
              AND d.SpecificDate = @specificDate
              AND ISNULL(p.IsMapping, 0) = 1;
        END
        ELSE
        BEGIN
            INSERT INTO #Overlays (SourceID, PriceRuleTypeID, StartTime, EndTime, Price)
            SELECT d.CourtDefaultPriceRuleID, d.PriceRuleTypeID, d.StartTime, d.EndTime, d.Price
            FROM CourtDefaultPriceRules d
            LEFT JOIN PriceRuleTypes p ON d.PriceRuleTypeID = p.PriceRuleTypeID
            WHERE d.IsActive = 1
              AND d.SpecificDate IS NULL
              AND d.DayOfWeek = @day
              AND ISNULL(p.IsMapping, 0) = 1;
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
        INSERT INTO #Result
        SELECT SourceID, @CourtID, PriceRuleTypeID, DayOfWeek, SpecificDate, StartTime, EndTime, Price, 1
        FROM #Base;

        DROP TABLE #Base;
        DROP TABLE #Overlays;

        SET @day = @day + 1;
    END

    -- Trả kết quả cuối cùng đã sắp xếp
    SELECT CourtPriceRuleID, CourtID, PriceRuleTypeID, DayOfWeek, SpecificDate, StartTime, EndTime, Price, IsActive
    FROM #Result
    ORDER BY DayOfWeek, StartTime;

    DROP TABLE #Result;
END
GO
