IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.sp_BulkUpdateBookingServices') AND type in (N'P', N'PC'))
BEGIN
    DROP PROCEDURE dbo.sp_BulkUpdateBookingServices;
END
GO

IF EXISTS (SELECT * FROM sys.types WHERE name = 'BookingServiceBulkUpdateType' AND is_table_type = 1)
BEGIN
    DROP TYPE dbo.BookingServiceBulkUpdateType;
END
GO

CREATE TYPE dbo.BookingServiceBulkUpdateType AS TABLE
(
    BookingServiceID INT NULL,
    ServiceID INT NOT NULL,
    Quantity INT NOT NULL,
    UnitPrice DECIMAL(18,2) NOT NULL,
    DiscountAmount DECIMAL(18,2) NOT NULL
);
GO

CREATE PROCEDURE dbo.sp_BulkUpdateBookingServices
    @BookingID UNIQUEIDENTIFIER,
    @ModifiedBy NVARCHAR(100),
    @Requests dbo.BookingServiceBulkUpdateType READONLY,
    @ErrorMessage NVARCHAR(4000) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET @ErrorMessage = NULL;

    BEGIN TRY
        BEGIN TRANSACTION;

        -- 1. Calculate stock differences for services that track stock
        DECLARE @StockDiffs TABLE (
            ServiceID INT,
            Diff INT
        );

        INSERT INTO @StockDiffs (ServiceID, Diff)
        SELECT 
            COALESCE(r.ServiceID, e.ServiceID) AS ServiceID,
            SUM(COALESCE(r.Quantity, 0) - COALESCE(e.Quantity, 0)) AS Diff
        FROM (
            SELECT * FROM dbo.BookingServices WHERE BookingID = @BookingID
        ) e
        FULL OUTER JOIN @Requests r ON e.BookingServiceID = r.BookingServiceID
        GROUP BY COALESCE(r.ServiceID, e.ServiceID);

        -- Check if any service tracks stock and the diff causes an overdraft
        DECLARE @InsufficientService NVARCHAR(200) = NULL;
        DECLARE @AvailableStock INT = 0;

        SELECT TOP 1 
            @InsufficientService = s.ServiceName,
            @AvailableStock = s.StockQuantity
        FROM @StockDiffs sd
        INNER JOIN dbo.Services s ON sd.ServiceID = s.ServiceID
        WHERE s.IsTrackStock = 1 AND sd.Diff > 0 AND s.StockQuantity < sd.Diff;

        IF @InsufficientService IS NOT NULL
        BEGIN
            SET @ErrorMessage = N'Dịch vụ ' + @InsufficientService + N' không đủ tồn kho (Hiện còn: ' + CAST(@AvailableStock AS NVARCHAR(10)) + N').';
            ROLLBACK TRANSACTION;
            RETURN;
        END

        -- Update stock for services with a non-zero difference
        UPDATE s
        SET s.StockQuantity = s.StockQuantity - sd.Diff,
            s.ModifiedDate = SYSDATETIMEOFFSET(),
            s.ModifiedBy = @ModifiedBy
        FROM dbo.Services s
        INNER JOIN @StockDiffs sd ON s.ServiceID = sd.ServiceID
        WHERE s.IsTrackStock = 1 AND sd.Diff <> 0;

        -- 2. Process deletions
        DECLARE @TotalDiff DECIMAL(18,2) = 0.00;
        DECLARE @DeletedAmount DECIMAL(18,2) = 0.00;
        
        SELECT @DeletedAmount = ISNULL(SUM(TotalAmount), 0)
        FROM dbo.BookingServices
        WHERE BookingID = @BookingID
          AND BookingServiceID NOT IN (SELECT BookingServiceID FROM @Requests WHERE BookingServiceID > 0);

        SET @TotalDiff = @TotalDiff - @DeletedAmount;

        DELETE FROM dbo.BookingServices
        WHERE BookingID = @BookingID
          AND BookingServiceID NOT IN (SELECT BookingServiceID FROM @Requests WHERE BookingServiceID > 0);

        -- 3. Process Updates
        DECLARE @UpdatedAmountDiff DECIMAL(18,2) = 0.00;

        SELECT @UpdatedAmountDiff = ISNULL(SUM((r.UnitPrice * r.Quantity - r.DiscountAmount) - e.TotalAmount), 0)
        FROM dbo.BookingServices e
        INNER JOIN @Requests r ON e.BookingServiceID = r.BookingServiceID
        WHERE e.BookingID = @BookingID;

        SET @TotalDiff = @TotalDiff + @UpdatedAmountDiff;

        UPDATE e
        SET e.Quantity = r.Quantity,
            e.UnitPrice = r.UnitPrice,
            e.DiscountAmount = r.DiscountAmount,
            e.TotalAmount = r.UnitPrice * r.Quantity - r.DiscountAmount,
            e.ModifiedDate = SYSDATETIMEOFFSET(),
            e.ModifiedBy = @ModifiedBy
        FROM dbo.BookingServices e
        INNER JOIN @Requests r ON e.BookingServiceID = r.BookingServiceID
        WHERE e.BookingID = @BookingID;

        -- 4. Process Additions
        DECLARE @AddedAmount DECIMAL(18,2) = 0.00;
        SELECT @AddedAmount = ISNULL(SUM(UnitPrice * Quantity - DiscountAmount), 0)
        FROM @Requests
        WHERE BookingServiceID IS NULL OR BookingServiceID <= 0;

        SET @TotalDiff = @TotalDiff + @AddedAmount;

        INSERT INTO dbo.BookingServices (
            BookingID, ServiceID, Quantity, UnitPrice, DiscountAmount, TotalAmount, CreatedDate, CreatedBy, ModifiedDate, ModifiedBy
        )
        SELECT 
            @BookingID, ServiceID, Quantity, UnitPrice, DiscountAmount, (UnitPrice * Quantity - DiscountAmount), SYSDATETIMEOFFSET(), @ModifiedBy, SYSDATETIMEOFFSET(), @ModifiedBy
        FROM @Requests
        WHERE BookingServiceID IS NULL OR BookingServiceID <= 0;

        -- 5. Update Booking total amount
        UPDATE dbo.Bookings
        SET TotalAmount = TotalAmount + @TotalDiff,
            ModifiedDate = SYSDATETIMEOFFSET(),
            ModifiedBy = @ModifiedBy
        WHERE BookingID = @BookingID;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        SET @ErrorMessage = ERROR_MESSAGE();
    END CATCH
END;
GO
