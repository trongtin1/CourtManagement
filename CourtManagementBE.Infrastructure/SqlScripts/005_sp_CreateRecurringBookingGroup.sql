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
    @ErrorMessage NVARCHAR(MAX) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
    SET DATEFIRST 7;

    DECLARE @BookingGroupID INT = 0;
    SET @ErrorMessage = NULL;

    BEGIN TRY
        BEGIN TRANSACTION;

        INSERT INTO BookingGroups (
            GroupType, CustomerID, FacilityID, TotalAmount, PaidAmount, Status, Note,
            CreatedDate, CreatedBy, ModifiedDate, ModifiedBy
        )
        VALUES (
            'returning', @CustomerID, @FacilityID, 0, 0, 0, ISNULL(@Note, ''),
            SYSDATETIMEOFFSET(), @CreatedBy, SYSDATETIMEOFFSET(), @CreatedBy
        );

        SET @BookingGroupID = SCOPE_IDENTITY();

        INSERT INTO RecurringConfigs (
            BookingGroupID, CourtID, StartDate, EndDate, StartTime, EndTime, DaysOfWeek
        )
        VALUES (
            @BookingGroupID, @CourtID, @StartDate, @EndDate, @StartTime, @EndTime, @DaysOfWeek
        );

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

        CREATE TABLE #BookingPrices (
            TargetDate DATE NOT NULL,
            TotalPrice DECIMAL(18,2) NOT NULL
        );

        DECLARE @LoopDate DATE;

        DECLARE DateCursor CURSOR LOCAL FAST_FORWARD FOR
            SELECT TargetDate
            FROM #TargetDates
            ORDER BY TargetDate;

        OPEN DateCursor;
        FETCH NEXT FROM DateCursor INTO @LoopDate;

        WHILE @@FETCH_STATUS = 0
        BEGIN
            CREATE TABLE #TempSlots (
                StartTime TIME(7) NOT NULL,
                EndTime TIME(7) NOT NULL
            );

            DECLARE @current TIME(7) = @StartTime;

            WHILE @current < @EndTime
            BEGIN
                DECLARE @next TIME(7) = DATEADD(HOUR, 1, @current);

                IF @next > @EndTime
                    SET @next = @EndTime;

                INSERT INTO #TempSlots (StartTime, EndTime)
                VALUES (@current, @next);

                SET @current = @next;
            END;

            DECLARE @loopDow INT = DATEPART(WEEKDAY, @LoopDate) - 1;
            DECLARE @LoopTotalPrice DECIMAL(18,2) = 0;

            SELECT @LoopTotalPrice = ISNULL(SUM(ISNULL(COALESCE(cp1.Price, cp2.Price, dp1.Price, dp2.Price), 0)), 0)
            FROM #TempSlots ts
            OUTER APPLY (
                SELECT TOP 1 p.Price
                FROM CourtPriceRules p
                WHERE p.CourtID = @CourtID
                  AND p.IsActive = 1
                  AND p.SpecificDate = @LoopDate
                  AND p.StartTime <= ts.StartTime
                  AND p.EndTime >= ts.EndTime
                ORDER BY p.StartTime
            ) cp1
            OUTER APPLY (
                SELECT TOP 1 p.Price
                FROM CourtPriceRules p
                WHERE p.CourtID = @CourtID
                  AND p.IsActive = 1
                  AND p.SpecificDate IS NULL
                  AND p.DayOfWeek = @loopDow
                  AND p.StartTime <= ts.StartTime
                  AND p.EndTime >= ts.EndTime
                ORDER BY p.StartTime
            ) cp2
            OUTER APPLY (
                SELECT TOP 1 d.Price
                FROM CourtDefaultPriceRules d
                WHERE d.IsActive = 1
                  AND d.IsMapping = 1
                  AND d.SpecificDate = @LoopDate
                  AND d.StartTime <= ts.StartTime
                  AND d.EndTime >= ts.EndTime
                ORDER BY d.StartTime
            ) dp1
            OUTER APPLY (
                SELECT TOP 1 d.Price
                FROM CourtDefaultPriceRules d
                WHERE d.IsActive = 1
                  AND d.IsMapping = 1
                  AND d.SpecificDate IS NULL
                  AND d.DayOfWeek = @loopDow
                  AND d.StartTime <= ts.StartTime
                  AND d.EndTime >= ts.EndTime
                ORDER BY d.StartTime
            ) dp2;

            INSERT INTO #BookingPrices (TargetDate, TotalPrice)
            VALUES (@LoopDate, @LoopTotalPrice);

            DROP TABLE #TempSlots;

            FETCH NEXT FROM DateCursor INTO @LoopDate;
        END;

        CLOSE DateCursor;
        DEALLOCATE DateCursor;

        DECLARE @TotalGroupAmount DECIMAL(18,2) = 0;

        SELECT @TotalGroupAmount = ISNULL(SUM(TotalPrice), 0)
        FROM #BookingPrices;

        DECLARE @InsDate DATE;
        DECLARE @InsPrice DECIMAL(18,2);

        DECLARE InsCursor CURSOR LOCAL FAST_FORWARD FOR
            SELECT TargetDate, TotalPrice
            FROM #BookingPrices
            ORDER BY TargetDate;

        OPEN InsCursor;
        FETCH NEXT FROM InsCursor INTO @InsDate, @InsPrice;

        WHILE @@FETCH_STATUS = 0
        BEGIN
            DECLARE @BookingID UNIQUEIDENTIFIER = NEWID();

            INSERT INTO Bookings (
                BookingID, CourtID, CustomerID, BookingDate, StartTime, EndTime,
                TotalAmount, PaidAmount, Status, CancellationReason, Note, BookingGroupID,
                CreatedDate, CreatedBy, ModifiedDate, ModifiedBy
            )
            VALUES (
                @BookingID, @CourtID, @CustomerID, CAST(@InsDate AS DATETIME),
                @StartTime, @EndTime, @InsPrice, 0, 'confirmed', N'',
                N'[Đặt định kỳ] Nhóm ID: #' + CAST(@BookingGroupID AS NVARCHAR(20)),
                @BookingGroupID,
                SYSDATETIMEOFFSET(), @CreatedBy, SYSDATETIMEOFFSET(), @CreatedBy
            );

            INSERT INTO BookingSlots (
                BookingID, CourtID, BookingDate, StartTime, EndTime
            )
            VALUES (
                @BookingID, @CourtID, CAST(@InsDate AS DATETIME), @StartTime, @EndTime
            );

            FETCH NEXT FROM InsCursor INTO @InsDate, @InsPrice;
        END;

        CLOSE InsCursor;
        DEALLOCATE InsCursor;

        UPDATE BookingGroups
        SET TotalAmount = @TotalGroupAmount
        WHERE BookingGroupID = @BookingGroupID;

        COMMIT TRANSACTION;

        DROP TABLE #TargetDates;
        DROP TABLE #BookingPrices;
    END TRY
    BEGIN CATCH
        IF CURSOR_STATUS('local', 'DateCursor') >= -1
        BEGIN
            CLOSE DateCursor;
            DEALLOCATE DateCursor;
        END;

        IF CURSOR_STATUS('local', 'InsCursor') >= -1
        BEGIN
            CLOSE InsCursor;
            DEALLOCATE InsCursor;
        END;

        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        IF @ErrorMessage IS NULL
            SET @ErrorMessage = ERROR_MESSAGE();

        IF OBJECT_ID('tempdb..#TempSlots') IS NOT NULL DROP TABLE #TempSlots;
        IF OBJECT_ID('tempdb..#TargetDates') IS NOT NULL DROP TABLE #TargetDates;
        IF OBJECT_ID('tempdb..#BookingPrices') IS NOT NULL DROP TABLE #BookingPrices;

        THROW 50000, @ErrorMessage, 1;
    END CATCH;
END;
GO