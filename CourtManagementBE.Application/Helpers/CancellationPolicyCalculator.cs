using System;
using CourtManagementBE.Domain.Entities;

namespace CourtManagementBE.Application.Helpers;

public class CancellationFeeCalculationRequest
{
    public decimal OriginalPaidAmount { get; set; }
    public DateTime BookingStartLocal { get; set; }
    public DateTime CurrentLocalTime { get; set; }
    public SystemSettings Settings { get; set; } = null!;
    public DateOnly BookingDate { get; set; }
    public bool IsFromGroup { get; set; }
    public string CustomReason { get; set; } = string.Empty;
}

public class CancellationFeeCalculationResult
{
    public bool ApplyFee { get; set; }
    public decimal PenaltyAmount { get; set; }
    public decimal RefundAmount { get; set; }
    public string RefundNote { get; set; } = string.Empty;
    public string PenaltyNote { get; set; } = string.Empty;
    public string HistoryNote { get; set; } = string.Empty;
}

public static class CancellationPolicyCalculator
{
    public static CancellationFeeCalculationResult Calculate(CancellationFeeCalculationRequest request)
    {
        var result = new CancellationFeeCalculationResult();

        if (request.OriginalPaidAmount <= 0)
        {
            result.HistoryNote = request.IsFromGroup
                ? $"Hủy theo nhóm đặt sân. Lý do: {request.CustomReason}."
                : $"Hủy đơn đặt sân. Lý do: {request.CustomReason}.";
            return result;
        }

        var settings = request.Settings;
        bool applyFee = settings.EnableCancellationFee && 
                        (request.BookingStartLocal - request.CurrentLocalTime).TotalHours < settings.CancellationThresholdHours;

        result.ApplyFee = applyFee;

        if (applyFee)
        {
            var feePercent = settings.CancellationFeePercent;
            result.PenaltyAmount = Math.Round(request.OriginalPaidAmount * feePercent / 100m, 2);
            result.RefundAmount = request.OriginalPaidAmount - result.PenaltyAmount;

            result.RefundNote = request.IsFromGroup
                ? $"[Hoàn cọc nhóm - Trừ phạt {feePercent}%] Hủy nhóm trễ dưới {settings.CancellationThresholdHours}h - Buổi chơi {request.BookingDate:dd/MM/yyyy}"
                : $"[Hoàn cọc nhóm - Trừ phạt {feePercent}%] Hủy lịch trễ dưới {settings.CancellationThresholdHours}h - Buổi chơi {request.BookingDate:dd/MM/yyyy}";

            result.PenaltyNote = request.IsFromGroup
                ? $"[Phí phạt hủy lịch theo nhóm {feePercent}%] Buổi chơi {request.BookingDate:dd/MM/yyyy}"
                : $"[Phí phạt hủy lịch {feePercent}%] Buổi chơi {request.BookingDate:dd/MM/yyyy}";

            if (result.RefundAmount > 0)
            {
                result.HistoryNote = request.IsFromGroup
                    ? $"Hủy theo nhóm đặt sân. Lý do: {request.CustomReason}. Phạt {feePercent}% ({result.PenaltyAmount:N0} đ). Đã hoàn trả {result.RefundAmount:N0} đ cọc vào quỹ cọc nhóm."
                    : $"Hủy đơn đặt sân. Lý do: {request.CustomReason}. Phạt {feePercent}% ({result.PenaltyAmount:N0} đ). Đã hoàn trả {result.RefundAmount:N0} đ cọc vào quỹ cọc nhóm.";
            }
            else
            {
                result.HistoryNote = request.IsFromGroup
                    ? $"Hủy theo nhóm đặt sân. Lý do: {request.CustomReason}. Phạt 100% không hoàn cọc nhóm {request.OriginalPaidAmount:N0} đ."
                    : $"Hủy đơn đặt sân. Lý do: {request.CustomReason}. Phạt 100% không hoàn cọc nhóm {request.OriginalPaidAmount:N0} đ.";
            }
        }
        else
        {
            result.RefundAmount = request.OriginalPaidAmount;
            result.PenaltyAmount = 0;

            result.RefundNote = request.IsFromGroup
                ? $"[Hoàn cọc nhóm] Hủy nhóm trước {settings.CancellationThresholdHours}h - Buổi chơi {request.BookingDate:dd/MM/yyyy}"
                : $"[Hoàn cọc nhóm] Hủy lịch trước {settings.CancellationThresholdHours}h - Buổi chơi {request.BookingDate:dd/MM/yyyy}";

            result.HistoryNote = request.IsFromGroup
                ? $"Hủy theo nhóm đặt sân. Lý do: {request.CustomReason}. Đã hoàn trả 100% ({result.RefundAmount:N0} đ) cọc vào quỹ cọc nhóm."
                : $"Hủy đơn đặt sân. Lý do: {request.CustomReason}. Đã hoàn trả 100% ({result.RefundAmount:N0} đ) cọc vào quỹ cọc nhóm.";
        }

        return result;
    }
}
