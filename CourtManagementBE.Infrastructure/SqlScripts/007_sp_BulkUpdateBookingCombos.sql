IF OBJECT_ID(N'dbo.sp_BulkUpdateBookingCombos', N'P') IS NOT NULL
BEGIN
    DROP PROCEDURE dbo.sp_BulkUpdateBookingCombos;
END;
GO

IF TYPE_ID(N'dbo.BookingComboBulkUpdateType') IS NOT NULL
BEGIN
    DROP TYPE dbo.BookingComboBulkUpdateType;
END;
GO

CREATE TYPE dbo.BookingComboBulkUpdateType AS TABLE
(
    BookingComboID INT NULL,
    ComboID INT NOT NULL,
    Quantity INT NOT NULL,
    UnitPrice DECIMAL(18,2) NOT NULL
);
GO

CREATE OR ALTER PROCEDURE dbo.sp_BulkUpdateBookingCombos
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

        DECLARE @Now DATETIMEOFFSET = SYSDATETIMEOFFSET();

        ------------------------------------------------------------
        -- 1. Tính tiền bị giảm do xóa combo
        ------------------------------------------------------------
        DECLARE @DeletedAmount DECIMAL(18,2) = 0;
        DECLARE @UpdatedAmountChange DECIMAL(18,2) = 0;
        DECLARE @AddedAmount DECIMAL(18,2) = 0;
        DECLARE @BookingAmountChange DECIMAL(18,2) = 0;

        SELECT
            @DeletedAmount = ISNULL(SUM(bc.TotalAmount), 0)
        FROM dbo.BookingCombos bc
        WHERE bc.BookingID = @BookingID
          AND NOT EXISTS
          (
              SELECT 1
              FROM @Requests r
              WHERE r.BookingComboID = bc.BookingComboID
          );

        SET @BookingAmountChange = @BookingAmountChange - @DeletedAmount;

        DELETE bc
        FROM dbo.BookingCombos bc
        WHERE bc.BookingID = @BookingID
          AND NOT EXISTS
          (
              SELECT 1
              FROM @Requests r
              WHERE r.BookingComboID = bc.BookingComboID
          );

        ------------------------------------------------------------
        -- 2. Tính tiền thay đổi do update combo cũ
        ------------------------------------------------------------
        SELECT
            @UpdatedAmountChange = ISNULL
            (
                SUM
                (
                    (r.UnitPrice * r.Quantity)
                    - bc.TotalAmount
                ),
                0
            )
        FROM dbo.BookingCombos bc
        INNER JOIN @Requests r
            ON bc.BookingComboID = r.BookingComboID
        WHERE bc.BookingID = @BookingID;

        SET @BookingAmountChange = @BookingAmountChange + @UpdatedAmountChange;

        UPDATE bc
        SET
            bc.ComboID = r.ComboID,
            bc.Quantity = r.Quantity,
            bc.UnitPrice = r.UnitPrice,
            bc.TotalAmount = r.UnitPrice * r.Quantity,
            bc.ModifiedDate = @Now,
            bc.ModifiedBy = @ModifiedBy
        FROM dbo.BookingCombos bc
        INNER JOIN @Requests r
            ON bc.BookingComboID = r.BookingComboID
        WHERE bc.BookingID = @BookingID;

        ------------------------------------------------------------
        -- 3. Tính tiền thêm mới
        ------------------------------------------------------------
        SELECT
            @AddedAmount = ISNULL
            (
                SUM(r.UnitPrice * r.Quantity),
                0
            )
        FROM @Requests r
        WHERE r.BookingComboID IS NULL
           OR r.BookingComboID <= 0;

        SET @BookingAmountChange = @BookingAmountChange + @AddedAmount;

        INSERT INTO dbo.BookingCombos
        (
            BookingID,
            ComboID,
            Quantity,
            UnitPrice,
            TotalAmount,
            CreatedDate,
            CreatedBy,
            ModifiedDate,
            ModifiedBy
        )
        SELECT
            @BookingID,
            r.ComboID,
            r.Quantity,
            r.UnitPrice,
            r.UnitPrice * r.Quantity,
            @Now,
            @ModifiedBy,
            @Now,
            @ModifiedBy
        FROM @Requests r
        WHERE r.BookingComboID IS NULL
           OR r.BookingComboID <= 0;

        ------------------------------------------------------------
        -- 4. Cập nhật tổng tiền booking
        ------------------------------------------------------------
        UPDATE dbo.Bookings
        SET
            TotalAmount = TotalAmount + @BookingAmountChange,
            ModifiedDate = @Now,
            ModifiedBy = @ModifiedBy
        WHERE BookingID = @BookingID;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        SET @ErrorMessage = ERROR_MESSAGE();
    END CATCH;
END;
GO
