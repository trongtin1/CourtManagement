-- Stored Procedure to cancel a booking and handle all transactional database modifications (payments, history, slots, stock)
IF OBJECT_ID('dbo.sp_CancelBooking', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_CancelBooking;
GO

CREATE PROCEDURE dbo.sp_CancelBooking
    @BookingID UNIQUEIDENTIFIER,
    @CancellationReason NVARCHAR(500),
    @RefundAmount DECIMAL(18,2),
    @PenaltyAmount DECIMAL(18,2),
    @RefundNote NVARCHAR(500),
    @PenaltyNote NVARCHAR(500),
    @PerformedBy VARCHAR(100),
    @HistoryNote NVARCHAR(500),
    @ErrorMessage NVARCHAR(4000) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        -- 1. Lấy thông tin booking và kiểm tra xem có tồn tại và chưa bị hủy không
        DECLARE @BookingGroupID INT;
        DECLARE @OriginalPaidAmount DECIMAL(18,2);
        DECLARE @Status VARCHAR(50);

        SELECT 
            @BookingGroupID = BookingGroupID,
            @OriginalPaidAmount = PaidAmount,
            @Status = Status
        FROM dbo.Bookings
        WHERE BookingID = @BookingID;

        IF @Status IS NULL
        BEGIN
            SET @ErrorMessage = N'Không tìm thấy đơn đặt sân.';
            ROLLBACK TRANSACTION;
            RETURN;
        END

        IF @Status = 'Cancelled'
        BEGIN
            SET @ErrorMessage = N'Đơn đặt sân đã bị hủy trước đó.';
            ROLLBACK TRANSACTION;
            RETURN;
        END

        -- 2. Cập nhật PaidAmount của Booking & BookingGroup + Tạo Payment record
        IF @BookingGroupID IS NOT NULL AND @RefundAmount > 0
        BEGIN
            -- Tạo Payment hoàn cọc nhóm
            INSERT INTO dbo.Payments (BookingID, BookingGroupID, Amount, RefundedAmount, PaymentMethod, PaymentDate, Status, Note, CreatedDate)
            VALUES (@BookingID, @BookingGroupID, -@RefundAmount, @RefundAmount, 'cash', GETUTCDATE(), 'refunded', @RefundNote, SYSDATETIMEOFFSET());

            -- Tạo Payment phạt nếu có
            IF @PenaltyAmount > 0
            BEGIN
                INSERT INTO dbo.Payments (BookingID, BookingGroupID, Amount, RefundedAmount, PaymentMethod, PaymentDate, Status, Note, CreatedDate)
                VALUES (@BookingID, @BookingGroupID, @PenaltyAmount, 0, 'cash', GETUTCDATE(), 'success', @PenaltyNote, SYSDATETIMEOFFSET());
            END

            -- Cập nhật Group PaidAmount
            UPDATE dbo.BookingGroups
            SET PaidAmount = PaidAmount + @RefundAmount,
                ModifiedDate = SYSDATETIMEOFFSET(),
                ModifiedBy = @PerformedBy
            WHERE BookingGroupID = @BookingGroupID;

            -- Cập nhật Booking PaidAmount = PenaltyAmount
            UPDATE dbo.Bookings
            SET PaidAmount = @PenaltyAmount,
                Status = 'Cancelled',
                CancellationReason = @CancellationReason,
                ModifiedDate = SYSDATETIMEOFFSET(),
                ModifiedBy = @PerformedBy
            WHERE BookingID = @BookingID;
        END
        ELSE
        BEGIN
            -- Cọc phạt 100% hoặc không hoàn cọc (hoặc không phải cọc nhóm)
            -- Cập nhật Booking
            UPDATE dbo.Bookings
            SET Status = 'Cancelled',
                CancellationReason = @CancellationReason,
                ModifiedDate = SYSDATETIMEOFFSET(),
                ModifiedBy = @PerformedBy
            WHERE BookingID = @BookingID;
        END

        -- 3. Xóa các slot đặt sân
        DELETE FROM dbo.BookingSlots
        WHERE BookingID = @BookingID;

        -- 4. Hoàn trả kho hàng cho các dịch vụ thuộc booking này
        UPDATE s
        SET s.StockQuantity = s.StockQuantity + bs.Quantity
        FROM dbo.Services s
        INNER JOIN dbo.BookingServices bs ON s.ServiceID = bs.ServiceID
        WHERE bs.BookingID = @BookingID AND s.IsTrackStock = 1;

        -- 5. Ghi log lịch sử đặt sân (BookingHistories)
        INSERT INTO dbo.BookingHistories (BookingID, Action, OldValue, NewValue, Note, PerformedBy, CreatedAt)
        VALUES (
            @BookingID, 
            'CANCEL', 
            CONCAT('Status: ', @Status, ', PaidAmount: ', @OriginalPaidAmount), 
            CONCAT('Status: Cancelled, PaidAmount: ', (SELECT PaidAmount FROM dbo.Bookings WHERE BookingID = @BookingID)), 
            @HistoryNote, 
            @PerformedBy, 
            SYSDATETIMEOFFSET()
        );

        COMMIT TRANSACTION;
        SET @ErrorMessage = NULL;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        SET @ErrorMessage = ERROR_MESSAGE();
    END CATCH
END
GO
