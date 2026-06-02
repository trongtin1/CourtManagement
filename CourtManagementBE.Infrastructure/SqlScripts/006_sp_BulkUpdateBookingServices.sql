IF OBJECT_ID(N'dbo.sp_BulkUpdateBookingServices', N'P') IS NOT NULL
BEGIN
    DROP PROCEDURE dbo.sp_BulkUpdateBookingServices;
END;
GO

IF TYPE_ID(N'dbo.BookingServiceBulkUpdateType') IS NOT NULL
BEGIN
    DROP TYPE dbo.BookingServiceBulkUpdateType;
END;
GO

CREATE TYPE dbo.BookingServiceBulkUpdateType AS TABLE
(
    BookingServiceID INT NULL,
    ServiceID INT NOT NULL,
    Quantity INT NOT NULL,
    UnitPrice DECIMAL(18,2) NOT NULL
);
GO

CREATE OR ALTER PROCEDURE dbo.sp_BulkUpdateBookingServices
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

        DECLARE @Now DATETIMEOFFSET = SYSDATETIMEOFFSET();

        ------------------------------------------------------------
        -- 1. Tính thay đổi số lượng để cập nhật tồn kho
        ------------------------------------------------------------
        DECLARE @StockAdjustments TABLE
        (
            ServiceID INT NOT NULL,
            QuantityChange INT NOT NULL
        );

        ;WITH CurrentBookingServices AS
        (
            SELECT
                BookingServiceID,
                ServiceID,
                Quantity
            FROM dbo.BookingServices
            WHERE BookingID = @BookingID
        ),
        ComparedServices AS
        (
            SELECT
                ISNULL(r.ServiceID, c.ServiceID) AS ServiceID,
                ISNULL(r.Quantity, 0) AS NewQuantity,
                ISNULL(c.Quantity, 0) AS OldQuantity
            FROM CurrentBookingServices c
            FULL OUTER JOIN @Requests r
                ON c.BookingServiceID = r.BookingServiceID
        )
        INSERT INTO @StockAdjustments
        (
            ServiceID,
            QuantityChange
        )
        SELECT
            ServiceID,
            SUM(NewQuantity - OldQuantity) AS QuantityChange
        FROM ComparedServices
        GROUP BY ServiceID;

        ------------------------------------------------------------
        -- 2. Kiểm tra tồn kho có đủ không
        ------------------------------------------------------------
        DECLARE @InsufficientService NVARCHAR(200);
        DECLARE @AvailableStock INT;

        SELECT TOP 1
            @InsufficientService = s.ServiceName,
            @AvailableStock = s.StockQuantity
        FROM @StockAdjustments sa
        INNER JOIN dbo.Services s
            ON sa.ServiceID = s.ServiceID
        WHERE s.IsTrackStock = 1
          AND sa.QuantityChange > 0
          AND s.StockQuantity < sa.QuantityChange;

        IF @InsufficientService IS NOT NULL
        BEGIN
            SET @ErrorMessage =
                N'Dịch vụ ' + @InsufficientService
                + N' không đủ tồn kho (Hiện còn: '
                + CAST(@AvailableStock AS NVARCHAR(10))
                + N').';

            ROLLBACK TRANSACTION;
            RETURN;
        END;

        ------------------------------------------------------------
        -- 3. Cập nhật tồn kho
        -- QuantityChange > 0: trừ tồn kho
        -- QuantityChange < 0: cộng lại tồn kho
        ------------------------------------------------------------
        UPDATE s
        SET
            s.StockQuantity = s.StockQuantity - sa.QuantityChange,
            s.ModifiedDate = @Now,
            s.ModifiedBy = @ModifiedBy
        FROM dbo.Services s
        INNER JOIN @StockAdjustments sa
            ON s.ServiceID = sa.ServiceID
        WHERE s.IsTrackStock = 1
          AND sa.QuantityChange <> 0;

        ------------------------------------------------------------
        -- 4. Tính tiền bị giảm do xóa service
        ------------------------------------------------------------
        DECLARE @DeletedAmount DECIMAL(18,2) = 0;
        DECLARE @UpdatedAmountChange DECIMAL(18,2) = 0;
        DECLARE @AddedAmount DECIMAL(18,2) = 0;
        DECLARE @BookingAmountChange DECIMAL(18,2) = 0;

        SELECT
            @DeletedAmount = ISNULL(SUM(bs.TotalAmount), 0)
        FROM dbo.BookingServices bs
        WHERE bs.BookingID = @BookingID
          AND NOT EXISTS
          (
              SELECT 1
              FROM @Requests r
              WHERE r.BookingServiceID = bs.BookingServiceID
          );

        SET @BookingAmountChange = @BookingAmountChange - @DeletedAmount;

        DELETE bs
        FROM dbo.BookingServices bs
        WHERE bs.BookingID = @BookingID
          AND NOT EXISTS
          (
              SELECT 1
              FROM @Requests r
              WHERE r.BookingServiceID = bs.BookingServiceID
          );

        ------------------------------------------------------------
        -- 5. Tính tiền thay đổi do update service cũ
        ------------------------------------------------------------
        SELECT
            @UpdatedAmountChange = ISNULL
            (
                SUM
                (
                    (r.UnitPrice * r.Quantity)
                    - bs.TotalAmount
                ),
                0
            )
        FROM dbo.BookingServices bs
        INNER JOIN @Requests r
            ON bs.BookingServiceID = r.BookingServiceID
        WHERE bs.BookingID = @BookingID;

        SET @BookingAmountChange = @BookingAmountChange + @UpdatedAmountChange;

        UPDATE bs
        SET
            bs.ServiceID = r.ServiceID,
            bs.Quantity = r.Quantity,
            bs.UnitPrice = r.UnitPrice,
            bs.TotalAmount = r.UnitPrice * r.Quantity,
            bs.ModifiedDate = @Now,
            bs.ModifiedBy = @ModifiedBy
        FROM dbo.BookingServices bs
        INNER JOIN @Requests r
            ON bs.BookingServiceID = r.BookingServiceID
        WHERE bs.BookingID = @BookingID;

        ------------------------------------------------------------
        -- 6. Tính tiền thêm mới
        ------------------------------------------------------------
        SELECT
            @AddedAmount = ISNULL
            (
                SUM(r.UnitPrice * r.Quantity),
                0
            )
        FROM @Requests r
        WHERE r.BookingServiceID IS NULL
           OR r.BookingServiceID <= 0;

        SET @BookingAmountChange = @BookingAmountChange + @AddedAmount;

        INSERT INTO dbo.BookingServices
        (
            BookingID,
            ServiceID,
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
            r.ServiceID,
            r.Quantity,
            r.UnitPrice,
            r.UnitPrice * r.Quantity,
            @Now,
            @ModifiedBy,
            @Now,
            @ModifiedBy
        FROM @Requests r
        WHERE r.BookingServiceID IS NULL
           OR r.BookingServiceID <= 0;

        ------------------------------------------------------------
        -- 7. Cập nhật tổng tiền booking
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