using System.Net;
using System.Text;
using System.Text.Json;
using CourtManagementBE.Api.Middlewares;
using System.Threading.RateLimiting;
using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.IServices;
using CourtManagementBE.Application.Services;
using CourtManagementBE.Infrastructure.Data.Interceptors;
using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Models;
using CourtManagementBE.Infrastructure.Common;
using CourtManagementBE.Infrastructure.Data;
using CourtManagementBE.Infrastructure.Extensions.HttpContextExtensions;
using CourtManagementBE.Infrastructure.Extensions.SqlExtentions;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using CourtManagementBE.Api.Profiles;
using Microsoft.OpenApi;

namespace CourtManagementBE.Api
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Đảm bảo cấu hình lấy được appsettings.json nếu chạy từ root thư mục ngoài
            builder.Configuration
                .AddJsonFile("CourtManagementBE.Api/appsettings.json", optional: true, reloadOnChange: true)
                .AddJsonFile($"CourtManagementBE.Api/appsettings.{builder.Environment.EnvironmentName}.json", optional: true, reloadOnChange: true);

            // ── CORS ──────────────────────────────────────────────────────
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowFrontend", policy =>
                {
                    policy.WithOrigins("http://localhost:5173", "http://127.0.0.1:5173") // URL frontend Vite
                          .AllowAnyHeader()
                          .AllowAnyMethod()
                          .AllowCredentials(); // BẮT BUỘC để gửi/nhận cookie
                });
            });

            // ── Swagger với JWT Authorize button ──────────────────────────
            builder.Services.AddEndpointsApiExplorer();

            builder.Services.AddSwaggerGen(options =>
            {
                options.SwaggerDoc("v1", new OpenApiInfo
                {
                    Title = "CourtManagementBE API",
                    Version = "v1"
                });

                // Define scheme
                options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Name = "Authorization",
                    Type = SecuritySchemeType.Http,
                    Scheme = "bearer",
                    BearerFormat = "JWT",
                    In = ParameterLocation.Header,
                    Description = "Nhập token dạng: Bearer {your_token}"
                });

                options.AddSecurityRequirement(doc =>
                    new OpenApiSecurityRequirement
                    {
                        {
                            new OpenApiSecuritySchemeReference("Bearer"),
                            new List<string>()
                        }
                    });
            });

            // ── DbContext ────────────────────────────────────────────
            // Interceptor phải đăng ký trước để AddDbContext dùng factory inject
            builder.Services.AddScoped<AuditInterceptor>();
            builder.Services.AddDbContext<AppDbContext>((sp, options) =>
            {
                options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
                options.AddInterceptors(sp.GetRequiredService<AuditInterceptor>());
            });

            // ── JWT Authentication ────────────────────────────────────────
            var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>()
                ?? throw new InvalidOperationException("Missing JwtSettings configuration.");

            builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JwtSettings"));

            builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,
                        ValidIssuer = jwtSettings.Issuer,
                        ValidAudience = jwtSettings.Audience,
                        IssuerSigningKey = new SymmetricSecurityKey(
                            Encoding.UTF8.GetBytes(jwtSettings.Key))
                    };
                });

            builder.Services.AddAuthorization();

            // ── Rate Limiting ─────────────────────────────────────────────
            builder.Services.AddRateLimiter(options =>
            {
                options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(httpContext =>
                {
                    var key = httpContext.User.Identity?.IsAuthenticated == true
                        ? httpContext.User.Identity!.Name!
                        : httpContext.Connection.RemoteIpAddress?.ToString() ?? "anonymous";

                    return RateLimitPartition.GetFixedWindowLimiter(
                        partitionKey: key,
                        factory: _ => new FixedWindowRateLimiterOptions
                        {
                            PermitLimit = 100, // 100 request
                            Window = TimeSpan.FromMinutes(1), // mỗi 1 phút
                            QueueLimit = 0,
                            AutoReplenishment = true
                        });
                });

                options.OnRejected = async (context, token) =>
                {
                    var httpContext = context.HttpContext;

                    if (context.Lease.TryGetMetadata(MetadataName.RetryAfter, out var retryAfter))
                    {
                        httpContext.Response.Headers.RetryAfter =
                            retryAfter.TotalSeconds.ToString();
                    }

                    httpContext.Response.StatusCode = StatusCodes.Status429TooManyRequests;
                    httpContext.Response.ContentType = "application/json";

                    var result = Result<object>.Failure(
                        HttpStatusCode.TooManyRequests,
                        "Too many requests. Please try again later."
                     );

                    var json = JsonSerializer.Serialize(result,
                        new JsonSerializerOptions
                        {
                            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                        });

                    await httpContext.Response.WriteAsync(json, token);
                };
            });
            // ── AutoMapper ─────────────────────────────────────────────────
            builder.Services.AddAutoMapper(cfg =>
            {
                cfg.AddMaps(typeof(MappingProfile).Assembly);
            });
            // ── DI ────────────────────────────────────────────────────────
            builder.Services.AddHttpContextAccessor();                            // cần cho CurrentUserService

            builder.Services.AddScoped<IHttpContextHelper, HttpContextHelper>();
            builder.Services.AddScoped<ICurrentUserContext, CurrentUserContext>();
            builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
            builder.Services.AddScoped<IAuthService, AuthService>();
            builder.Services.AddScoped<IFacilityService, FacilityService>();
            builder.Services.AddScoped<IAreaService, AreaService>();
            builder.Services.AddScoped<ICourtService, CourtService>();
            builder.Services.AddScoped<ICourtTypeService, CourtTypeService>();
            builder.Services.AddScoped<ICourtStatusService, CourtStatusService>();
            builder.Services.AddScoped<ICourtFeatureService, CourtFeatureService>();
            builder.Services.AddScoped<ICourtFeatureMappingService, CourtFeatureMappingService>();
            builder.Services.AddScoped<ICourtAssetService, CourtAssetService>();
            builder.Services.AddScoped<IUtilityService, UtilityService>();
            builder.Services.AddScoped<IPriceRuleTypeService, PriceRuleTypeService>();
            builder.Services.AddScoped<ICourtDefaultPriceRuleService, CourtDefaultPriceRuleService>();
            builder.Services.AddScoped<ICourtLockedSlotService, CourtLockedSlotService>();
            builder.Services.AddScoped<ICourtPriceService, CourtPriceService>();
            builder.Services.AddScoped<ICustomerService, CustomerService>();
            builder.Services.AddScoped<IBookingService, BookingService>();
            builder.Services.AddScoped<IServiceService, ServiceService>();
            builder.Services.AddScoped<IComboService, ComboService>();
            builder.Services.AddScoped<IPaymentService, PaymentService>();
            builder.Services.AddScoped<ICourtAreaMappingService, CourtAreaMappingService>();
            builder.Services.AddScoped<ICourtUtilityService, CourtUtilityService>();
            builder.Services.AddScoped<IBookingSlotService, BookingSlotService>();
            builder.Services.AddScoped<IBookingServiceService, BookingServiceService>();

            builder.Services.AddScoped<ICourtPriceHistoryService, CourtPriceHistoryService>();
            builder.Services.AddScoped<IDashboardService, DashboardService>();
            builder.Services.AddScoped<IBookingStatusService, BookingStatusService>();
            builder.Services.AddScoped<IPaymentStatusService, PaymentStatusService>();
            builder.Services.AddScoped<IPaymentMethodService, PaymentMethodService>();
            builder.Services.AddScoped<ICustomerTypeService, CustomerTypeService>();
            builder.Services.AddScoped<IServiceTypeService, ServiceTypeService>();
            builder.Services.AddScoped<IUnitService, UnitService>();
            builder.Services.AddScoped<IAssetCategoryService, AssetCategoryService>();
            builder.Services.AddScoped<IAssetConditionService, AssetConditionService>();
            builder.Services.AddScoped<ICourtFeatureCategoryService, CourtFeatureCategoryService>();
            builder.Services.AddScoped<ICancellationReasonService, CancellationReasonService>();
            builder.Services.AddScoped<IRefundReasonService, RefundReasonService>();

            builder.Services.AddControllers();

            // ─────────────────────────────────────────────────────────────
            var app = builder.Build();

            // ── Seed data nếu chưa có ─────────────────────────────────
            using (var scope = app.Services.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                await db.Database.MigrateAsync();
                await AppDbSeeder.SeedAsync(db);
            }

            // ── Chạy SQL scripts (stored procedures, ...) ────────────────
            await app.RunSqlScriptsAsync();

            // ── Middleware pipeline ───────────────────────────────────────
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseExceptionMiddleware();

            app.UseHttpsRedirection();

            app.UseCors("AllowFrontend");        // phải trước Authentication

            app.UseRateLimiter();                // Rate limiting

            app.UseAuthentication();             // JWT
            app.UseAuthorization();

            app.MapControllers();

            app.Run();
        }
    }
}
