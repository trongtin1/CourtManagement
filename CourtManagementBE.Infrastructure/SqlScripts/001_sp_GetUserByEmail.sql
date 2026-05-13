-- =============================================
-- Ví dụ: Stored Procedure lấy User theo Email
-- Đặt file .sql vào thư mục SqlScripts,
-- app sẽ tự động chạy khi khởi động.
-- =============================================

-- Xoá nếu đã tồn tại để tạo lại (idempotent)
IF OBJECT_ID('dbo.sp_GetUserByEmail', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_GetUserByEmail;
GO

CREATE PROCEDURE dbo.sp_GetUserByEmail
    @Email NVARCHAR(256)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM Users WHERE Email = @Email;
END
GO
