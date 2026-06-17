using System;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using CourtManagementBE.Application.Common;
using CourtManagementBE.Domain.Entities;
using CourtManagementBE.Infrastructure.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace CourtManagementBE.Infrastructure.Idempotency
{
    public class IdempotencyService : IIdempotencyService
    {
        private readonly AppDbContext _context;

        public IdempotencyService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<T?> GetResponseAsync<T>(string key, object requestBody) where T : class
        {
            if (string.IsNullOrWhiteSpace(key)) return null;

            var computedHash = ComputeHash(requestBody);
            var record = await _context.IdempotencyKeys
                .FirstOrDefaultAsync(x => x.Key == key);

            if (record == null) return null;

            // Kiểm tra xem request body có khớp với Hash cũ không (chống giả mạo key)
            if (record.RequestHash != computedHash)
            {
                throw new BadHttpRequestException("Idempotency-Key conflict: Request body does not match the previous request.", StatusCodes.Status400BadRequest);
            }

            return JsonSerializer.Deserialize<T>(record.ResponseContent);
        }

        public async Task SaveResponseAsync(string key, object requestBody, object response)
        {
            if (string.IsNullOrWhiteSpace(key)) return;

            var computedHash = ComputeHash(requestBody);
            var responseContent = JsonSerializer.Serialize(response);

            var record = new IdempotencyKey
            {
                Key = key,
                RequestHash = computedHash,
                ResponseContent = responseContent,
                CreatedAt = DateTimeOffset.UtcNow
            };

            _context.IdempotencyKeys.Add(record);
            await _context.SaveChangesAsync();
        }

        private string ComputeHash(object obj)
        {
            var json = JsonSerializer.Serialize(obj);
            using (var sha256 = SHA256.Create())
            {
                var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(json));
                var sb = new StringBuilder();
                foreach (var b in bytes)
                {
                    sb.Append(b.ToString("x2"));
                }
                return sb.ToString();
            }
        }
    }
}
