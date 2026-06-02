IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.sp_BulkUpdateBookingCombos') AND type in (N'P', N'PC'))
BEGIN
    DROP PROCEDURE dbo.sp_BulkUpdateBookingCombos;
END
GO

IF EXISTS (SELECT * FROM sys.types WHERE name = 'BookingComboBulkUpdateType' AND is_table_type = 1)
BEGIN
    DROP TYPE dbo.BookingComboBulkUpdateType;
END
GO

CREATE TYPE dbo.BookingComboBulkUpdateType AS TABLE
(
    BookingComboID INT NULL,
    ComboID INT NOT NULL,
    Quantity INT NOT NULL,
    UnitPrice DECIMAL(18,2) NOT NULL,
    DiscountAmount DECIMAL(18,2) NOT NULL
);
GO

CREATE PROCEDURE dbo.sp_BulkUpdateBookingCombos
    @BookingID UNIQUEIDENTIFIER,
    @ModifiedBy NVARCHAR(100),
    @Requests dbo.BookingComboBulkUpdateType READONLY,
    @ErrorMessage NVARCHAR(4000) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET @ErrorMessage = NULL;

    BEGIN TRY
        BEGIN TRANSACTION;

        -- 1. Process deletions
        DECLARE @TotalDiff DECIMAL(18,2) = 0.00;
        DECLARE @DeletedAmount DECIMAL(18,2) = 0.00;
        
        SELECT @DeletedAmount = ISNULL(SUM(TotalAmount), 0)
        FROM dbo.BookingCombos
        WHERE BookingID = @BookingID
          AND BookingComboID NOT IN (SELECT BookingComboID FROM @Requests WHERE BookingComboID > 0);

        SET @TotalDiff = @TotalDiff - @DeletedAmount;

        DELETE FROM dbo.BookingCombos
        WHERE BookingID = @BookingID
          AND BookingComboID NOT IN (SELECT BookingComboID FROM @Requests WHERE BookingComboID > 0);

        -- 2. Process Updates
        DECLARE @UpdatedAmountDiff DECIMAL(18,2) = 0.00;

        SELECT @UpdatedAmountDiff = ISNULL(SUM((r.UnitPrice * r.Quantity - r.DiscountAmount) - e.TotalAmount), 0)
        FROM dbo.BookingCombos e
        INNER JOIN @Requests r ON e.BookingComboID = r.BookingComboID
        WHERE e.BookingID = @BookingID;

        SET @TotalDiff = @TotalDiff + @UpdatedAmountDiff;

        UPDATE e
        SET e.Quantity = r.Quantity,
            e.UnitPrice = r.UnitPrice,
            e.DiscountAmount = r.DiscountAmount,
            e.TotalAmount = r.UnitPrice * r.Quantity - r.DiscountAmount,
            e.ModifiedDate = SYSDATETIMEOFFSET(),
            e.ModifiedBy = @ModifiedBy
        FROM dbo.BookingCombos e
        INNER JOIN @Requests r ON e.BookingComboID = r.BookingComboID
        WHERE e.BookingID = @BookingID;

        -- 3. Process Additions
        DECLARE @AddedAmount DECIMAL(18,2) = 0.00;
        SELECT @AddedAmount = ISNULL(SUM(UnitPrice * Quantity - DiscountAmount), 0)
        FROM @Requests
        WHERE BookingComboID IS NULL OR BookingComboID <= 0;

        SET @TotalDiff = @TotalDiff + @AddedAmount;

        INSERT INTO dbo.BookingCombos (
            BookingID, ComboID, Quantity, UnitPrice, DiscountAmount, TotalAmount, CreatedDate, CreatedBy, ModifiedDate, ModifiedBy
        )
        SELECT 
            @BookingID, ComboID, Quantity, UnitPrice, DiscountAmount, (UnitPrice * Quantity - DiscountAmount), SYSDATETIMEOFFSET(), @ModifiedBy, SYSDATETIMEOFFSET(), @ModifiedBy
        FROM @Requests
        WHERE BookingComboID IS NULL OR BookingComboID <= 0;

        -- 4. Update Booking total amount
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
