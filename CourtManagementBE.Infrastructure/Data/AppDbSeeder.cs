using CourtManagementBE.Domain.Entities;
using CourtManagementBE.Domain.Enums;
using CourtManagementBE.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace CourtManagementBE.Infrastructure.Data;

public static class AppDbSeeder
{
    private const string AdminLogin = "admin";
    private const string AdminPassword = "admin";

    public static async Task SeedAsync(AppDbContext db, CancellationToken cancellationToken = default)
    {
        await SeedAdminAsync(db, cancellationToken);
        await SeedSystemSettingsAsync(db, cancellationToken);
        await SeedMasterDataAsync(db, cancellationToken);
        await SeedBookingStatusesAsync(db, cancellationToken);

        var facility = await GetOrCreateFacilityAsync(db, cancellationToken);
        var courtTypes = await GetOrCreateCourtTypesAsync(db, cancellationToken);
        var courtStatuses = await GetOrCreateCourtStatusesAsync(db, cancellationToken);
        var courtFeatures = await GetOrCreateCourtFeaturesAsync(db, cancellationToken);
        var utilities = await GetOrCreateUtilitiesAsync(db, cancellationToken);
        var areas = await GetOrCreateAreasAsync(db, facility.FacilityID, cancellationToken);
        var courts = await GetOrCreateCourtsAsync(
            db,
            facility.FacilityID,
            courtTypes,
            courtStatuses,
            cancellationToken);
        var services = await GetOrCreateServicesAsync(db, cancellationToken);
        var customers = await GetOrCreateCustomersAsync(db, cancellationToken);

        await SeedCourtAreaMappingsAsync(db, courts, areas, cancellationToken);
        await SeedCourtFeatureMappingsAsync(db, courts, courtFeatures, cancellationToken);
        await SeedCourtUtilitiesAsync(db, courts, utilities, cancellationToken);
        await SeedCourtAssetsAsync(db, courts, cancellationToken);
        await SeedBookingsAsync(db, courts, services, customers, cancellationToken);
        await SeedAccountingDataAsync(db, cancellationToken);
    }

    private static async Task SeedAdminAsync(AppDbContext db, CancellationToken cancellationToken)
    {
        var admin = await db.Users.FirstOrDefaultAsync(x => x.Email == AdminLogin, cancellationToken);
        if (admin is null)
        {
            db.Users.Add(new User
            {
                Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
                FullName = "Administrator",
                Email = AdminLogin,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(AdminPassword),
                Role = "SuperAdmin",
            });

            await db.SaveChangesAsync(cancellationToken);
            return;
        }

        if (!BCrypt.Net.BCrypt.Verify(AdminPassword, admin.PasswordHash))
        {
            admin.PasswordHash = BCrypt.Net.BCrypt.HashPassword(AdminPassword);
            admin.Role = "SuperAdmin";
            admin.FacilityID = null;
            await db.SaveChangesAsync(cancellationToken);
        }
    }

    private static async Task<Facilities> GetOrCreateFacilityAsync(
        AppDbContext db,
        CancellationToken cancellationToken)
    {
        var facility = await db.Facilities
            .FirstOrDefaultAsync(x => x.FacilityName == "Demo Sports Center", cancellationToken);

        if (facility is not null)
        {
            return facility;
        }

        facility = new Facilities
        {
            FacilityName = "Demo Sports Center",
            Address = "123 Nguyen Trai, District 1, Ho Chi Minh City",
            Phone = "0900000000",
            Email = "demo@court.local",
            ImageURL = "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea",
            Description = "Seed facility for local development.",
            IsActive = true,
        };

        db.Facilities.Add(facility);
        await db.SaveChangesAsync(cancellationToken);
        return facility;
    }

    private static async Task SeedMasterDataAsync(AppDbContext db, CancellationToken cancellationToken)
    {

        await SeedMasterAsync(db.PaymentStatuses, [
            new PaymentStatuses { Code = "pending", Name = "Chờ xử lý", ColorCode = "#f59e0b", IsFinal = false, SortOrder = 1 },
            new PaymentStatuses { Code = "success", Name = "Thành công", ColorCode = "#16a34a", IsFinal = true, SortOrder = 2 },
            new PaymentStatuses { Code = "paid", Name = "Đã thanh toán", ColorCode = "#16a34a", IsFinal = true, SortOrder = 3 },
            new PaymentStatuses { Code = "failed", Name = "Thất bại", ColorCode = "#dc2626", IsFinal = true, SortOrder = 4 },
            new PaymentStatuses { Code = "refunded", Name = "Đã hoàn tiền", ColorCode = "#7c3aed", IsFinal = true, SortOrder = 5 },
        ], cancellationToken);

        await SeedMasterAsync(db.PaymentMethods, [
            new PaymentMethods { Code = "cash", Name = "Tiền mặt", IsOnline = false, SortOrder = 1 },
            new PaymentMethods { Code = "bank_transfer", Name = "Chuyển khoản", IsOnline = true, SortOrder = 2 },
            new PaymentMethods { Code = "qr", Name = "Quét mã QR", IsOnline = true, SortOrder = 3 },
            new PaymentMethods { Code = "momo", Name = "Ví MoMo", IsOnline = true, SortOrder = 4 },
            new PaymentMethods { Code = "vnpay", Name = "Cổng VNPay", IsOnline = true, SortOrder = 5 },
        ], cancellationToken);

        await SeedMasterAsync(db.CustomerTypes, [
            new CustomerTypes { Code = "normal", Name = "Thường", DiscountPercent = 0, SortOrder = 1 },
            new CustomerTypes { Code = "member", Name = "Thành viên", DiscountPercent = 5, SortOrder = 2 },
            new CustomerTypes { Code = "vip", Name = "VIP", DiscountPercent = 10, SortOrder = 3 },
        ], cancellationToken);

        await SeedMasterAsync(db.ServiceTypes, [
            new ServiceTypes { Code = "drink", Name = "Nước uống", SortOrder = 1 },
            new ServiceTypes { Code = "rental", Name = "Cho thuê đồ", SortOrder = 2 },
            new ServiceTypes { Code = "equipment", Name = "Thiết bị & dụng cụ", SortOrder = 3 },
        ], cancellationToken);

        await SeedMasterAsync(db.PriceRuleTypes, [
            new PriceRuleTypes { Code = "normal", Name = "Bình thường", ColorCode = "#0ea5e9", SortOrder = 1 },
            new PriceRuleTypes { Code = "off_peak", Name = "Giá giờ thấp điểm", ColorCode = "#22c55e", SortOrder = 2 },
            new PriceRuleTypes { Code = "peak", Name = "Giá giờ cao điểm", ColorCode = "#f97316", SortOrder = 3 },
            new PriceRuleTypes { Code = "golden", Name = "Giá giờ vàng", ColorCode = "#eab308", SortOrder = 4 },
            new PriceRuleTypes { Code = "weekend", Name = "Cuối tuần", ColorCode = "#8b5cf6", SortOrder = 5 },
        ], cancellationToken);

        await SeedMasterAsync(db.Units, [
            new Units { Code = "bottle", Name = "Chai", Symbol = "chai", SortOrder = 1 },
            new Units { Code = "racket", Name = "Cái", Symbol = "cái", SortOrder = 2 },
            new Units { Code = "tube", Name = "Ống", Symbol = "ống", SortOrder = 3 },
            new Units { Code = "piece", Name = "Chiếc", Symbol = "chiếc", SortOrder = 4 },
            new Units { Code = "set", Name = "Bộ", Symbol = "bộ", SortOrder = 5 },
            new Units { Code = "hour", Name = "Giờ", Symbol = "giờ", SortOrder = 6 },
        ], cancellationToken);

        await SeedMasterAsync(db.AssetCategories, [
            new AssetCategories { Code = "Equipment", Name = "Thiết bị", SortOrder = 1 },
            new AssetCategories { Code = "Lighting", Name = "Hệ thống chiếu sáng", SortOrder = 2 },
            new AssetCategories { Code = "Furniture", Name = "Nội thất", SortOrder = 3 },
        ], cancellationToken);

        await SeedMasterAsync(db.AssetConditions, [
            new AssetConditions { Code = "Good", Name = "Tốt", ColorCode = "#16a34a", IsUsable = true, SortOrder = 1 },
            new AssetConditions { Code = "Maintenance", Name = "Bảo trì", ColorCode = "#f59e0b", IsUsable = false, SortOrder = 2 },
            new AssetConditions { Code = "Broken", Name = "Hỏng", ColorCode = "#dc2626", IsUsable = false, SortOrder = 3 },
        ], cancellationToken);

        await SeedMasterAsync(db.CourtFeatureCategories, [
            new CourtFeatureCategories { Code = "Environment", Name = "Môi trường sân", SortOrder = 1 },
            new CourtFeatureCategories { Code = "Property", Name = "Thuộc tính", SortOrder = 2 },
            new CourtFeatureCategories { Code = "Surface", Name = "Bề mặt sân", SortOrder = 3 },
        ], cancellationToken);

        await SeedMasterAsync(db.CancellationReasons, [
            new CancellationReasons { Code = "customer_request", Name = "Khách yêu cầu huỷ", SortOrder = 1 },
            new CancellationReasons { Code = "court_maintenance", Name = "Sân bảo trì", SortOrder = 2 },
            new CancellationReasons { Code = "weather", Name = "Thời tiết xấu", SortOrder = 3 },
            new CancellationReasons { Code = "admin_cancelled", Name = "Quản trị viên hủy", SortOrder = 4 },
        ], cancellationToken);

        await SeedMasterAsync(db.RefundReasons, [
            new RefundReasons { Code = "booking_cancelled", Name = "Huỷ lịch đặt sân", SortOrder = 1 },
            new RefundReasons { Code = "duplicate_payment", Name = "Thanh toán trùng lặp", SortOrder = 2 },
            new RefundReasons { Code = "service_issue", Name = "Vấn đề về dịch vụ", SortOrder = 3 },
        ], cancellationToken);

        await db.SaveChangesAsync(cancellationToken);
    }

    private static async Task SeedMasterAsync<T>(
        DbSet<T> dbSet,
        IEnumerable<T> seed,
        CancellationToken cancellationToken)
        where T : MasterDataBase
    {
        foreach (var item in seed)
        {
            if (!await dbSet.AnyAsync(x => x.Code == item.Code, cancellationToken))
            {
                dbSet.Add(item);
            }
        }
    }

    private static async Task SeedAccountingMasterAsync<T>(
        DbSet<T> dbSet,
        IEnumerable<T> seed,
        CancellationToken cancellationToken)
        where T : MasterDataBase
    {
        foreach (var item in seed)
        {
            var existing = await dbSet.FirstOrDefaultAsync(x => x.Code == item.Code, cancellationToken);
            if (existing is null)
            {
                dbSet.Add(item);
                continue;
            }

            existing.Name = item.Name;
            existing.Description = item.Description;
            existing.SortOrder = item.SortOrder;
            existing.IsActive = item.IsActive;

            if (existing is AccountingAccountTypes existingAccountType && item is AccountingAccountTypes accountType)
            {
                existingAccountType.NormalBalance = accountType.NormalBalance;
            }

            if (existing is JournalDocumentTypes existingDocumentType && item is JournalDocumentTypes documentType)
            {
                existingDocumentType.VoucherPrefix = documentType.VoucherPrefix;
            }
        }
    }

    private static async Task<List<CourtTypes>> GetOrCreateCourtTypesAsync(
        AppDbContext db,
        CancellationToken cancellationToken)
    {
        var seed = new[]
        {
            new CourtTypes { Code = "BADMINTON", Name = "Sân Cầu lông", Description = "Sân cầu lông tiêu chuẩn trong nhà" },
            new CourtTypes { Code = "TENNIS", Name = "Sân Tennis", Description = "Sân tennis tiêu chuẩn ngoài trời" },
            new CourtTypes { Code = "PICKLEBALL", Name = "Sân Pickleball", Description = "Sân pickleball tiêu chuẩn thi đấu" },
        };

        foreach (var item in seed)
        {
            if (!await db.CourtTypes.AnyAsync(x => x.Code == item.Code, cancellationToken))
            {
                db.CourtTypes.Add(item);
            }
        }

        await db.SaveChangesAsync(cancellationToken);

        var codes = seed.Select(x => x.Code).ToList();
        return await db.CourtTypes.Where(x => codes.Contains(x.Code)).ToListAsync(cancellationToken);
    }

    private static async Task<List<CourtStatus>> GetOrCreateCourtStatusesAsync(
        AppDbContext db,
        CancellationToken cancellationToken)
    {
        var seed = new[]
        {
            new CourtStatus { StatusCode = "available", StatusName = "Sẵn sàng", ColorCode = "#22c55e", Description = "Có thể đặt sân hoạt động bình thường", CreatedBy = AdminLogin },
            new CourtStatus { StatusCode = "maintenance", StatusName = "Bảo trì", ColorCode = "#f97316", Description = "Tạm dừng hoạt động để bảo trì nâng cấp", CreatedBy = AdminLogin },
            new CourtStatus { StatusCode = "closed", StatusName = "Đóng cửa", ColorCode = "#64748b", Description = "Sân đóng cửa dừng hoạt động", CreatedBy = AdminLogin },
        };

        foreach (var item in seed)
        {
            if (!await db.CourtStatuses.AnyAsync(x => x.StatusCode == item.StatusCode, cancellationToken))
            {
                db.CourtStatuses.Add(item);
            }
        }

        await db.SaveChangesAsync(cancellationToken);

        var codes = seed.Select(x => x.StatusCode).ToList();
        return await db.CourtStatuses.Where(x => codes.Contains(x.StatusCode)).ToListAsync(cancellationToken);
    }

    private static async Task<List<CourtFeatures>> GetOrCreateCourtFeaturesAsync(
        AppDbContext db,
        CancellationToken cancellationToken)
    {
        var categories = await db.CourtFeatureCategories
            .ToDictionaryAsync(x => x.Code, x => x.CourtFeatureCategoryID, cancellationToken);

        var seed = new[]
        {
            new { Feature = new CourtFeatures { FeatureCode = "INDOOR", FeatureName = "Trong nhà", Description = "Khu vực sân có mái che trong nhà", CreatedBy = AdminLogin }, CategoryCode = "Environment" },
            new { Feature = new CourtFeatures { FeatureCode = "OUTDOOR", FeatureName = "Ngoài trời", Description = "Khu vực sân ngoài trời thoáng mát", CreatedBy = AdminLogin }, CategoryCode = "Environment" },
            new { Feature = new CourtFeatures { FeatureCode = "VIP", FeatureName = "Sân VIP", Description = "Sân tiêu chuẩn chất lượng cao dịch vụ VIP", CreatedBy = AdminLogin }, CategoryCode = "Property" },
            new { Feature = new CourtFeatures { FeatureCode = "WOODEN_FLOOR", FeatureName = "Sàn gỗ", Description = "Bề mặt sàn bằng gỗ tự nhiên cao cấp", CreatedBy = AdminLogin }, CategoryCode = "Surface" },
            new { Feature = new CourtFeatures { FeatureCode = "AIR_CONDITIONED", FeatureName = "Có máy lạnh", Description = "Sân được trang bị hệ thống điều hòa mát mẻ", CreatedBy = AdminLogin }, CategoryCode = "Environment" },
        };

        foreach (var seedItem in seed)
        {
            var item = seedItem.Feature;
            if (categories.TryGetValue(seedItem.CategoryCode, out var categoryId))
            {
                item.CourtFeatureCategoryID = categoryId;
            }

            if (!await db.CourtFeatures.AnyAsync(x => x.FeatureCode == item.FeatureCode, cancellationToken))
            {
                db.CourtFeatures.Add(item);
            }
            else
            {
                var existing = await db.CourtFeatures.FirstAsync(x => x.FeatureCode == item.FeatureCode, cancellationToken);
                if (existing.CourtFeatureCategoryID is null)
                {
                    existing.CourtFeatureCategoryID = item.CourtFeatureCategoryID;
                }
            }
        }

        await db.SaveChangesAsync(cancellationToken);

        var codes = seed.Select(x => x.Feature.FeatureCode).ToList();
        return await db.CourtFeatures.Where(x => codes.Contains(x.FeatureCode)).ToListAsync(cancellationToken);
    }

    private static async Task<List<Utilities>> GetOrCreateUtilitiesAsync(
        AppDbContext db,
        CancellationToken cancellationToken)
    {
        var seed = new[]
        {
            new Utilities { UtilityCode = "LIGHT", UtilityName = "Hệ thống đèn chiếu sáng", Description = "Hệ thống đèn cao áp ban đêm", Icon = "bulb", CreatedBy = AdminLogin },
            new Utilities { UtilityCode = "PARKING", UtilityName = "Bãi giữ xe", Description = "Bãi giữ xe rộng rãi an toàn", Icon = "car", CreatedBy = AdminLogin },
            new Utilities { UtilityCode = "SHOWER", UtilityName = "Phòng tắm & thay đồ", Description = "Phòng tắm có nóng lạnh hiện đại", Icon = "shower", CreatedBy = AdminLogin },
            new Utilities { UtilityCode = "WIFI", UtilityName = "Wi-Fi miễn phí", Description = "Wi-Fi tốc độ cao cho khách hàng", Icon = "wifi", CreatedBy = AdminLogin },
        };

        foreach (var item in seed)
        {
            if (!await db.Utilities.AnyAsync(x => x.UtilityCode == item.UtilityCode, cancellationToken))
            {
                db.Utilities.Add(item);
            }
        }

        await db.SaveChangesAsync(cancellationToken);

        var codes = seed.Select(x => x.UtilityCode).ToList();
        return await db.Utilities.Where(x => codes.Contains(x.UtilityCode)).ToListAsync(cancellationToken);
    }

    private static async Task<List<Areas>> GetOrCreateAreasAsync(
        AppDbContext db,
        int facilityId,
        CancellationToken cancellationToken)
    {
        var seed = new[]
        {
            new Areas { FacilityID = facilityId, AreaCode = "A", AreaName = "Khu A", TotalLength = 40, TotalWidth = 25, Description = "Khu vá»±c sÃ¢n trong nhÃ  chÃ­nh" },
            new Areas { FacilityID = facilityId, AreaCode = "B", AreaName = "Khu B", TotalLength = 36, TotalWidth = 22, Description = "Khu vá»±c sÃ¢n ngoÃ i trá»i" },
        };

        foreach (var item in seed)
        {
            if (!await db.Areas.AnyAsync(x => x.FacilityID == facilityId && x.AreaCode == item.AreaCode, cancellationToken))
            {
                db.Areas.Add(item);
            }
        }

        await db.SaveChangesAsync(cancellationToken);
        return await db.Areas.Where(x => x.FacilityID == facilityId).ToListAsync(cancellationToken);
    }

    private static async Task<List<Courts>> GetOrCreateCourtsAsync(
        AppDbContext db,
        int facilityId,
        List<CourtTypes> courtTypes,
        List<CourtStatus> courtStatuses,
        CancellationToken cancellationToken)
    {
        var badminton = courtTypes.First(x => x.Code == "BADMINTON");
        var pickleball = courtTypes.First(x => x.Code == "PICKLEBALL");
        var available = courtStatuses.First(x => x.StatusCode == "available");

        var seed = new[]
        {
            new Courts { FacilityID = facilityId, CourtTypeID = badminton.CourtTypeID, CourtCode = "A01", CourtName = "SÃ¢n Cáº§u lÃ´ng A01", StatusID = available.StatusID, Length = 13.4f, Width = 6.1f, Capacity = 4, SortOrder = 1, Description = "SÃ¢n cáº§u lÃ´ng trong nhÃ  Khu A01", CreatedBy = AdminLogin, ModifiedBy = AdminLogin },
            new Courts { FacilityID = facilityId, CourtTypeID = badminton.CourtTypeID, CourtCode = "A02", CourtName = "SÃ¢n Cáº§u lÃ´ng A02", StatusID = available.StatusID, Length = 13.4f, Width = 6.1f, Capacity = 4, SortOrder = 2, Description = "SÃ¢n cáº§u lÃ´ng trong nhÃ  Khu A02", CreatedBy = AdminLogin, ModifiedBy = AdminLogin },
            new Courts { FacilityID = facilityId, CourtTypeID = pickleball.CourtTypeID, CourtCode = "B01", CourtName = "SÃ¢n Pickleball B01", StatusID = available.StatusID, Length = 13.4f, Width = 6.1f, Capacity = 4, SortOrder = 3, Description = "SÃ¢n pickleball Khu B01", CreatedBy = AdminLogin, ModifiedBy = AdminLogin },
        };

        foreach (var item in seed)
        {
            if (!await db.Courts.AnyAsync(x => x.FacilityID == facilityId && x.CourtCode == item.CourtCode, cancellationToken))
            {
                db.Courts.Add(item);
            }
        }

        await db.SaveChangesAsync(cancellationToken);
        return await db.Courts.Where(x => x.FacilityID == facilityId).ToListAsync(cancellationToken);
    }

    private static async Task<List<Services>> GetOrCreateServicesAsync(
        AppDbContext db,
        CancellationToken cancellationToken)
    {
        var drinkType = await db.ServiceTypes.FirstOrDefaultAsync(x => x.Code == "drink", cancellationToken);
        var rentalType = await db.ServiceTypes.FirstOrDefaultAsync(x => x.Code == "rental", cancellationToken);
        var equipType = await db.ServiceTypes.FirstOrDefaultAsync(x => x.Code == "equipment", cancellationToken);
        var bottleUnit = await db.Units.FirstOrDefaultAsync(x => x.Code == "bottle", cancellationToken);
        var racketUnit = await db.Units.FirstOrDefaultAsync(x => x.Code == "racket", cancellationToken);
        var tubeUnit = await db.Units.FirstOrDefaultAsync(x => x.Code == "tube", cancellationToken);

        var seed = new[]
        {
            new Services { ServiceCode = "WATER", ServiceName = "Nước suối đóng chai", ServiceTypeID = drinkType?.ServiceTypeID, UnitID = bottleUnit?.UnitID, MinQuantity = 1, MaxQuantity = 50, Price = 10_000m, CreatedBy = AdminLogin, ModifiedBy = AdminLogin },
            new Services { ServiceCode = "RACKET", ServiceName = "Thuê vợt cầu lông", ServiceTypeID = rentalType?.ServiceTypeID, UnitID = racketUnit?.UnitID, MinQuantity = 1, MaxQuantity = 10, Price = 30_000m, CreatedBy = AdminLogin, ModifiedBy = AdminLogin },
            new Services { ServiceCode = "SHUTTLE", ServiceName = "Ống cầu lông (12 quả)", ServiceTypeID = equipType?.ServiceTypeID, UnitID = tubeUnit?.UnitID, MinQuantity = 1, MaxQuantity = 20, Price = 120_000m, CreatedBy = AdminLogin, ModifiedBy = AdminLogin },
        };

        foreach (var item in seed)
        {
            if (!await db.Services.AnyAsync(x => x.ServiceCode == item.ServiceCode, cancellationToken))
            {
                db.Services.Add(item);
            }
        }

        await db.SaveChangesAsync(cancellationToken);
        return await db.Services.ToListAsync(cancellationToken);
    }

    private static async Task<List<Customers>> GetOrCreateCustomersAsync(
        AppDbContext db,
        CancellationToken cancellationToken)
    {
        var seed = new[]
        {
            new Customers { CustomerName = "Nguyễn Văn An", Phone = "0901111111", Email = "an@example.com", CustomerType = "member", Note = "Khách hàng Thành viên mẫu" },
            new Customers { CustomerName = "Trần Thị Bình", Phone = "0902222222", Email = "binh@example.com", CustomerType = "vip", Note = "Khách hàng VIP mẫu" },
            new Customers { CustomerName = "Lê Minh Châu", Phone = "0903333333", Email = "chau@example.com", CustomerType = "normal", Note = "Khách hàng Thường mẫu" },
        };

        foreach (var item in seed)
        {
            if (!await db.Customers.AnyAsync(x => x.Phone == item.Phone, cancellationToken))
            {
                db.Customers.Add(item);
            }
        }

        await db.SaveChangesAsync(cancellationToken);
        return await db.Customers.ToListAsync(cancellationToken);
    }

    private static async Task SeedCourtAreaMappingsAsync(
        AppDbContext db,
        List<Courts> courts,
        List<Areas> areas,
        CancellationToken cancellationToken)
    {
        var areaByCode = areas.ToDictionary(x => x.AreaCode);
        var courtAreaCodes = new Dictionary<string, string>
        {
            ["A01"] = "A",
            ["A02"] = "A",
            ["B01"] = "B",
        };

        foreach (var court in courts)
        {
            if (!courtAreaCodes.TryGetValue(court.CourtCode, out var areaCode)
                || !areaByCode.TryGetValue(areaCode, out var area))
            {
                continue;
            }

            if (!await db.CourtAreaMappings.AnyAsync(
                x => x.CourtID == court.CourtID && x.AreaID == area.AreaID,
                cancellationToken))
            {
                var areaIndex = areas.FindIndex(x => x.AreaID == area.AreaID);
                db.CourtAreaMappings.Add(new CourtAreaMapping
                {
                    CourtID = court.CourtID,
                    AreaID = area.AreaID,
                    PositionX = court.SortOrder * 12,
                    PositionY = areaIndex <= 0 ? 8 : 28,
                    DisplayOrder = court.SortOrder,
                });
            }
        }

        await db.SaveChangesAsync(cancellationToken);
    }

    private static async Task SeedCourtUtilitiesAsync(
        AppDbContext db,
        List<Courts> courts,
        List<Utilities> utilities,
        CancellationToken cancellationToken)
    {
        var utilityIds = utilities
            .Where(x => x.UtilityCode is "LIGHT" or "PARKING" or "WIFI")
            .Select(x => x.UtilityID)
            .ToList();

        foreach (var court in courts)
        {
            foreach (var utilityId in utilityIds)
            {
                if (!await db.CourtUtilities.AnyAsync(
                    x => x.CourtID == court.CourtID && x.UtilityID == utilityId,
                    cancellationToken))
                {
                    db.CourtUtilities.Add(new CourtUtilities
                    {
                        CourtID = court.CourtID,
                        UtilityID = utilityId,
                        CreatedBy = AdminLogin,
                    });
                }
            }
        }

        await db.SaveChangesAsync(cancellationToken);
    }

    private static async Task SeedCourtFeatureMappingsAsync(
        AppDbContext db,
        List<Courts> courts,
        List<CourtFeatures> courtFeatures,
        CancellationToken cancellationToken)
    {
        var featureByCode = courtFeatures.ToDictionary(x => x.FeatureCode);
        var featureCodesByCourtCode = new Dictionary<string, string[]>
        {
            ["A01"] = ["INDOOR", "WOODEN_FLOOR", "AIR_CONDITIONED"],
            ["A02"] = ["INDOOR", "WOODEN_FLOOR"],
            ["B01"] = ["OUTDOOR"],
        };

        foreach (var court in courts)
        {
            if (!featureCodesByCourtCode.TryGetValue(court.CourtCode, out var featureCodes))
            {
                continue;
            }

            foreach (var featureCode in featureCodes)
            {
                if (!featureByCode.TryGetValue(featureCode, out var feature))
                {
                    continue;
                }

                if (!await db.CourtFeatureMappings.AnyAsync(
                    x => x.CourtID == court.CourtID && x.CourtFeatureID == feature.CourtFeatureID,
                    cancellationToken))
                {
                    db.CourtFeatureMappings.Add(new CourtFeatureMappings
                    {
                        CourtID = court.CourtID,
                        CourtFeatureID = feature.CourtFeatureID,
                        CreatedBy = AdminLogin,
                    });
                }
            }
        }

        await db.SaveChangesAsync(cancellationToken);
    }

    private static async Task SeedCourtAssetsAsync(
        AppDbContext db,
        List<Courts> courts,
        CancellationToken cancellationToken)
    {
        foreach (var court in courts)
        {
            var seed = new[]
            {
                new CourtAssets { CourtID = court.CourtID, AssetCode = $"{court.CourtCode}-NET", AssetName = "Lưới thi đấu", Category = "Equipment", Quantity = 1, Unit = "piece", Condition = "Good", CreatedBy = AdminLogin, ModifiedBy = AdminLogin },
                new CourtAssets { CourtID = court.CourtID, AssetCode = $"{court.CourtCode}-LIGHT", AssetName = "Bộ đèn chiếu sáng", Category = "Lighting", Quantity = 1, Unit = "set", Condition = "Good", CreatedBy = AdminLogin, ModifiedBy = AdminLogin },
                new CourtAssets { CourtID = court.CourtID, AssetCode = $"{court.CourtCode}-BENCH", AssetName = "Ghế ngồi vận động viên", Category = "Furniture", Quantity = 2, Unit = "piece", Condition = "Good", CreatedBy = AdminLogin, ModifiedBy = AdminLogin },
            };

            foreach (var item in seed)
            {
                if (!await db.CourtAssets.AnyAsync(
                    x => x.CourtID == item.CourtID && x.AssetCode == item.AssetCode,
                    cancellationToken))
                {
                    db.CourtAssets.Add(item);
                }
            }
        }

        await db.SaveChangesAsync(cancellationToken);
    }




    private static async Task SeedBookingsAsync(
        AppDbContext db,
        List<Courts> courts,
        List<Services> services,
        List<Customers> customers,
        CancellationToken cancellationToken)
    {
        if (await db.Bookings.AnyAsync(cancellationToken)
            || courts.Count == 0
            || services.Count == 0
            || customers.Count == 0)
        {
            return;
        }

        var bookingDate = DateOnly.FromDateTime(DateTime.Today.AddDays(1));
        var court = courts.OrderBy(x => x.SortOrder).First();
        var startTime = new TimeSpan(6, 0, 0);
        var endTime = new TimeSpan(8, 0, 0);
        var customer = customers.First();
        var service = services.First(x => x.ServiceCode == "WATER");
        var servicePrice = service.Price;
        var courtPrice = 100_000m;
        var serviceQuantity = 2;
        var serviceTotal = servicePrice * serviceQuantity;
        var bookingId = Guid.Parse("22222222-2222-2222-2222-222222222222");

        db.Bookings.Add(new Bookings
        {
            BookingID = bookingId,
            CourtID = court.CourtID,
            CustomerID = customer.CustomerID,
            BookingDate = bookingDate,
            TotalAmount = courtPrice + serviceTotal,
            Status = BookingStatusConstants.Confirmed,
            Note = "Äáº·t lá»‹ch máº«u",
            CreatedBy = AdminLogin,
            ModifiedBy = AdminLogin,
        });

        await db.SaveChangesAsync(cancellationToken);

        db.BookingSlots.Add(new BookingSlots
        {
            BookingID = bookingId,
            CourtID = court.CourtID,
            BookingDate = bookingDate,
            StartTime = startTime,
            EndTime = endTime,
        });

        db.BookingServices.Add(new BookingServices
        {
            BookingID = bookingId,
            ServiceID = service.ServiceID,
            Quantity = serviceQuantity,
            UnitPrice = servicePrice,
            TotalAmount = serviceTotal,
            CreatedBy = AdminLogin,
            ModifiedBy = AdminLogin,
        });

        db.Payments.Add(new Payments
        {
            BookingID = bookingId,
            Amount = courtPrice + serviceTotal,
            PaymentMethod = "cash",
            Status = "success",
            Note = "Thanh toÃ¡n máº«u",
            PaymentDate = DateTime.Today,
        });

        await db.SaveChangesAsync(cancellationToken);
    }

    private static async Task SeedBookingStatusesAsync(AppDbContext db, CancellationToken cancellationToken)
    {
        var seed = new[]
        {
            new BookingStatuses { Code = "001", StatusName = "Pending", LabelName = "Chờ duyệt / Chờ cọc (Pending)", IsTerminal = false, CanReschedule = true, CanCombo = true, CanService = true, ColorCode = "warning" },
            new BookingStatuses { Code = "002", StatusName = "Confirmed", LabelName = "Đã xác nhận (Đã thanh toán cọc) (Confirmed)", IsTerminal = false, CanReschedule = true, CanCombo = true, CanService = true, ColorCode = "processing" },
            new BookingStatuses { Code = "003", StatusName = "CheckedIn", LabelName = "Đã nhận sân (CheckedIn)", IsTerminal = false, CanReschedule = false, CanCombo = true, CanService = true, ColorCode = "success" },
            new BookingStatuses { Code = "004", StatusName = "Completed", LabelName = "Hoàn tất buổi chơi (Completed)", IsTerminal = true, CanReschedule = false, CanCombo = false, CanService = false, ColorCode = "success" },
            new BookingStatuses { Code = "005", StatusName = "Cancelled", LabelName = "Hủy đơn hàng (Cancelled)", IsTerminal = true, CanReschedule = false, CanCombo = false, CanService = false, ColorCode = "error" },
            new BookingStatuses { Code = "006", StatusName = "NoShow", LabelName = "Khách không đến (NoShow)", IsTerminal = true, CanReschedule = false, CanCombo = false, CanService = false, ColorCode = "default" }
        };

        foreach (var item in seed)
        {
            var existing = await db.BookingStatuses.FirstOrDefaultAsync(x => x.Code == item.Code, cancellationToken);
            if (existing is null)
            {
                db.BookingStatuses.Add(item);
            }
            else
            {
                existing.CanCombo = item.CanCombo;
                existing.CanService = item.CanService;
                existing.IsTerminal = item.IsTerminal;
                existing.CanReschedule = item.CanReschedule;
                existing.ColorCode = item.ColorCode;
                existing.LabelName = item.LabelName;
                existing.StatusName = item.StatusName;
            }
        }

        await db.SaveChangesAsync(cancellationToken);
    }

    private static async Task SeedSystemSettingsAsync(AppDbContext db, CancellationToken cancellationToken)
    {
        var settings = await db.SystemSettings.FirstOrDefaultAsync(cancellationToken);
        if (settings is null)
        {
            db.SystemSettings.Add(new SystemSettings
            {
                SlotDurationMinutes = 60,
                OpeningTime = new TimeSpan(6, 0, 0),
                ClosingTime = new TimeSpan(22, 0, 0),
                Timezone = "Asia/Ho_Chi_Minh",
                EnableCancellationFee = true,
                CancellationFeePercent = 20.0m,
                CancellationThresholdHours = 24.0,
                BufferDurationMinutes = 10,
                MinBookingDurationMinutes = 60,
                MaxBookingDurationMinutes = 180,
                MinAllowableGapMinutes = 60,
                MaxPreBookingDays = 14,
                EnableDeposit = true,
                DepositPercent = 30
            });
            await db.SaveChangesAsync(cancellationToken);
        }
        else
        {
            bool isUpdated = false;
            if (settings.BufferDurationMinutes == 0) { settings.BufferDurationMinutes = 10; isUpdated = true; }
            if (settings.MinBookingDurationMinutes == 0) { settings.MinBookingDurationMinutes = 60; isUpdated = true; }
            if (settings.MaxBookingDurationMinutes == 0) { settings.MaxBookingDurationMinutes = 180; isUpdated = true; }
            if (settings.MinAllowableGapMinutes == 0) { settings.MinAllowableGapMinutes = 60; isUpdated = true; }
            if (settings.MaxPreBookingDays == 0) { settings.MaxPreBookingDays = 14; isUpdated = true; }
            if (settings.DepositPercent == 0) { settings.DepositPercent = 30; isUpdated = true; }
            if (isUpdated)
            {
                db.SystemSettings.Update(settings);
                await db.SaveChangesAsync(cancellationToken);
            }
        }
    }

    private static async Task UpsertCashFundAsync(
        AppDbContext db,
        string code,
        string name,
        string accountCode,
        decimal openingBalance,
        int sortOrder,
        CancellationToken cancellationToken)
    {
        var existing = await db.CashFunds.FirstOrDefaultAsync(x => x.Code == code, cancellationToken);
        if (existing is null)
        {
            db.CashFunds.Add(new CashFund
            {
                Code = code,
                Name = name,
                AccountCode = accountCode,
                OpeningBalance = openingBalance,
                SortOrder = sortOrder,
                IsActive = true
            });
            return;
        }

        existing.Name = name;
        existing.AccountCode = accountCode;
        existing.OpeningBalance = openingBalance;
        existing.SortOrder = sortOrder;
        existing.IsActive = true;
    }

    private static async Task UpsertBankAccountAsync(
        AppDbContext db,
        string code,
        string bankName,
        string accountNumberMasked,
        string accountCode,
        decimal openingBalance,
        string colorCode,
        int sortOrder,
        CancellationToken cancellationToken)
    {
        var existing = await db.BankAccounts.FirstOrDefaultAsync(x => x.Code == code, cancellationToken);
        if (existing is null)
        {
            db.BankAccounts.Add(new BankAccount
            {
                Code = code,
                BankName = bankName,
                AccountNumberMasked = accountNumberMasked,
                AccountCode = accountCode,
                OpeningBalance = openingBalance,
                ColorCode = colorCode,
                SortOrder = sortOrder,
                IsActive = true
            });
            return;
        }

        existing.BankName = bankName;
        existing.AccountNumberMasked = accountNumberMasked;
        existing.AccountCode = accountCode;
        existing.OpeningBalance = openingBalance;
        existing.ColorCode = colorCode;
        existing.SortOrder = sortOrder;
        existing.IsActive = true;
    }

    private static async Task SeedAccountingDataAsync(AppDbContext db, CancellationToken cancellationToken)
    {
        await SeedAccountingMasterAsync(db.AccountingAccountTypes, [
            new AccountingAccountTypes { Code = "Asset", Name = "Tài sản", NormalBalance = "Debit", SortOrder = 1 },
            new AccountingAccountTypes { Code = "Liability", Name = "Nợ phải trả", NormalBalance = "Credit", SortOrder = 2 },
            new AccountingAccountTypes { Code = "Equity", Name = "Vốn chủ sở hữu", NormalBalance = "Credit", SortOrder = 3 },
            new AccountingAccountTypes { Code = "Revenue", Name = "Doanh thu", NormalBalance = "Credit", SortOrder = 4 },
            new AccountingAccountTypes { Code = "Expense", Name = "Chi phí", NormalBalance = "Debit", SortOrder = 5 },
        ], cancellationToken);

        await SeedAccountingMasterAsync(db.JournalDocumentTypes, [
            new JournalDocumentTypes { Code = "PT", Name = "Phiếu thu", VoucherPrefix = "PT", SortOrder = 1 },
            new JournalDocumentTypes { Code = "PC", Name = "Phiếu chi", VoucherPrefix = "PC", SortOrder = 2 },
            new JournalDocumentTypes { Code = "BC", Name = "Báo có ngân hàng", VoucherPrefix = "BC", SortOrder = 3 },
            new JournalDocumentTypes { Code = "BN", Name = "Báo nợ ngân hàng", VoucherPrefix = "BN", SortOrder = 4 },
            new JournalDocumentTypes { Code = "HD", Name = "Hóa đơn", VoucherPrefix = "HD", SortOrder = 5 },
            new JournalDocumentTypes { Code = "CN", Name = "Chứng từ công nợ", VoucherPrefix = "CN", SortOrder = 6 },
        ], cancellationToken);

        await SeedAccountingMasterAsync(db.BusinessPartnerTypes, [
            new BusinessPartnerTypes { Code = "Customer", Name = "Khách hàng", SortOrder = 1 },
            new BusinessPartnerTypes { Code = "Supplier", Name = "Nhà cung cấp", SortOrder = 2 },
            new BusinessPartnerTypes { Code = "Employee", Name = "Nhân viên", SortOrder = 3 },
            new BusinessPartnerTypes { Code = "Other", Name = "Khác", SortOrder = 4 },
        ], cancellationToken);

        await UpsertCashFundAsync(db, "cash-main", "Quỹ tiền mặt chính", "1111", 12000000m, 1, cancellationToken);
        await UpsertCashFundAsync(db, "cash-q1", "Quỹ tiền mặt chi nhánh Quận 1", "1111", 6200000m, 2, cancellationToken);
        await UpsertCashFundAsync(db, "cash-tdc", "Quỹ tiền mặt chi nhánh Thủ Đức", "1111", 1600000m, 3, cancellationToken);

        await UpsertBankAccountAsync(db, "vcb", "Vietcombank", "**** 4821", "1121", 184200000m, "#10b981", 1, cancellationToken);
        await UpsertBankAccountAsync(db, "bidv", "BIDV", "**** 7392", "1121", 96400000m, "#06b6d4", 2, cancellationToken);
        await UpsertBankAccountAsync(db, "mb", "MB Bank", "**** 1024", "1121", 82800000m, "#8b5cf6", 3, cancellationToken);
        await UpsertBankAccountAsync(db, "tcb", "Techcombank", "**** 5560", "1121", 49400000m, "#f43f5e", 4, cancellationToken);
        await db.SaveChangesAsync(cancellationToken);

        async Task UpsertAccount(string id, string code, string name, string type, int level, string? parentAccountId = null)
        {
            var existing = await db.ChartOfAccounts.FirstOrDefaultAsync(x => x.AccountCode == code, cancellationToken);
            if (existing is null)
            {
                db.ChartOfAccounts.Add(new ChartOfAccount
                {
                    Id = id,
                    AccountCode = code,
                    AccountName = name,
                    AccountType = type,
                    ParentAccountId = parentAccountId,
                    Level = level,
                    IsActive = true
                });
                return;
            }

            existing.AccountName = name;
            existing.AccountType = type;
            existing.ParentAccountId = parentAccountId;
            existing.Level = level;
            existing.IsActive = true;
        }

        await UpsertAccount("coa_111", "111", "Tiền mặt", "Asset", 1);
        await UpsertAccount("coa_1111", "1111", "Tiền mặt VNĐ", "Asset", 2, "coa_111");
        await UpsertAccount("coa_112", "112", "Tiền gửi ngân hàng", "Asset", 1);
        await UpsertAccount("coa_1121", "1121", "Tiền gửi ngân hàng VNĐ", "Asset", 2, "coa_112");
        await UpsertAccount("coa_131", "131", "Phải thu khách hàng", "Asset", 1);
        await UpsertAccount("coa_331", "331", "Phải trả nhà cung cấp", "Liability", 1);
        await UpsertAccount("coa_338", "338", "Phải trả, phải nộp khác", "Liability", 1);
        await UpsertAccount("coa_511", "511", "Doanh thu bán hàng và cung cấp dịch vụ", "Revenue", 1);
        await UpsertAccount("coa_5111", "5111", "Doanh thu dịch vụ cho thuê sân", "Revenue", 2, "coa_511");
        await UpsertAccount("coa_512", "512", "Doanh thu bán hàng canteen/nước uống", "Revenue", 1);
        await UpsertAccount("coa_642", "642", "Chi phí quản lý", "Expense", 1);
        await db.SaveChangesAsync(cancellationToken);

        async Task UpsertRule(string id, string ruleName, string transactionType, string sourceTable, string description, int priority, bool isActive = true)
        {
            var existing = await db.AccountingRules.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
            if (existing is null)
            {
                db.AccountingRules.Add(new AccountingRule
                {
                    Id = id,
                    RuleName = ruleName,
                    TransactionType = transactionType,
                    SourceTable = sourceTable,
                    Description = description,
                    Priority = priority,
                    IsActive = isActive
                });
                return;
            }

            existing.RuleName = ruleName;
            existing.TransactionType = transactionType;
            existing.SourceTable = sourceTable;
            existing.Description = description;
            existing.Priority = priority;
            existing.IsActive = isActive;
        }

        await UpsertRule("rule_pay_cash", "Thanh toán tiền mặt", "BOOKING_PAYMENT", "Payments", "Thanh toán đặt sân bằng tiền mặt", 10);
        await UpsertRule("rule_receivable_cash", "Thu công nợ tiền mặt", "RECEIVABLE_PAYMENT", "Payments", "Thu công nợ khách hàng bằng tiền mặt", 30);
        await UpsertRule("rule_booking_postpaid", "Ghi nhận công nợ đặt sân", "BOOKING_POSTPAID", "Bookings", "Ghi nhận công nợ đặt sân trả sau", 10);
        await db.SaveChangesAsync(cancellationToken);

        async Task UpsertCondition(string id, string ruleId, string fieldName, string op, string expectedValue, string logicalGroup, int sortOrder)
        {
            var existing = await db.AccountingRuleConditions.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
            if (existing is null)
            {
                db.AccountingRuleConditions.Add(new AccountingRuleCondition
                {
                    Id = id,
                    RuleId = ruleId,
                    FieldName = fieldName,
                    Operator = op,
                    ExpectedValue = expectedValue,
                    LogicalGroup = logicalGroup,
                    SortOrder = sortOrder
                });
                return;
            }

            existing.RuleId = ruleId;
            existing.FieldName = fieldName;
            existing.Operator = op;
            existing.ExpectedValue = expectedValue;
            existing.LogicalGroup = logicalGroup;
            existing.SortOrder = sortOrder;
        }

        await UpsertCondition("cond_pay_cash", "rule_pay_cash", "PaymentMethod", "=", "cash", "GP_CASH", 10);
        await UpsertCondition("cond_pay_bank_transfer", "rule_pay_bank", "PaymentMethod", "=", "bank_transfer", "GP_BANK", 20);
        await UpsertCondition("cond_pay_banking", "rule_pay_bank", "PaymentMethod", "=", "banking", "GP_BANKING", 30);
        await UpsertCondition("cond_pay_qr", "rule_pay_bank", "PaymentMethod", "=", "qr", "GP_QR", 40);
        await UpsertCondition("cond_pay_vnpay", "rule_pay_bank", "PaymentMethod", "=", "vnpay", "GP_VNPAY", 50);
        await UpsertCondition("cond_pay_momo", "rule_pay_bank", "PaymentMethod", "=", "momo", "GP_MOMO", 60);
        await UpsertCondition("cond_receivable_cash", "rule_receivable_cash", "PaymentMethod", "=", "cash", "GP_REC_CASH", 10);
        await UpsertCondition("cond_receivable_bank_transfer", "rule_receivable_bank", "PaymentMethod", "=", "bank_transfer", "GP_REC_BANK", 20);
        await UpsertCondition("cond_receivable_banking", "rule_receivable_bank", "PaymentMethod", "=", "banking", "GP_REC_BANKING", 30);
        await UpsertCondition("cond_receivable_qr", "rule_receivable_bank", "PaymentMethod", "=", "qr", "GP_REC_QR", 40);
        await UpsertCondition("cond_receivable_vnpay", "rule_receivable_bank", "PaymentMethod", "=", "vnpay", "GP_REC_VNPAY", 50);
        await UpsertCondition("cond_receivable_momo", "rule_receivable_bank", "PaymentMethod", "=", "momo", "GP_REC_MOMO", 60);
        await UpsertCondition("cond_booking_completed", "rule_booking_postpaid", "Status", "=", "004", "GP_POSTPAID", 10);
        await db.SaveChangesAsync(cancellationToken);

        async Task UpsertRuleLine(string id, string ruleId, string accountCode, string entryType, string valueSource, string descriptionTemplate)
        {
            var existing = await db.AccountingRuleLines.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
            if (existing is null)
            {
                db.AccountingRuleLines.Add(new AccountingRuleLine
                {
                    Id = id,
                    RuleId = ruleId,
                    AccountCode = accountCode,
                    EntryType = entryType,
                    ValueSource = valueSource,
                    DescriptionTemplate = descriptionTemplate
                });
                return;
            }

            existing.RuleId = ruleId;
            existing.AccountCode = accountCode;
            existing.EntryType = entryType;
            existing.ValueSource = valueSource;
            existing.DescriptionTemplate = descriptionTemplate;
        }

        await UpsertRuleLine("line_pay_cash_debit", "rule_pay_cash", "1111", "Debit", "Amount", "Thu tiền mặt");
        await UpsertRuleLine("line_pay_cash_credit_court", "rule_pay_cash", "5111", "Credit", "CourtAmount", "Doanh thu thuê sân");
        await UpsertRuleLine("line_pay_cash_credit_service", "rule_pay_cash", "512", "Credit", "ServiceAmount", "Doanh thu dịch vụ");
        await UpsertRuleLine("line_pay_bank_debit", "rule_pay_bank", "1121", "Debit", "Amount", "Thu qua ngân hàng/cổng thanh toán");
        await UpsertRuleLine("line_pay_bank_credit_court", "rule_pay_bank", "5111", "Credit", "CourtAmount", "Doanh thu thuê sân");
        await UpsertRuleLine("line_pay_bank_credit_service", "rule_pay_bank", "512", "Credit", "ServiceAmount", "Doanh thu dịch vụ");
        await UpsertRuleLine("line_receivable_cash_debit", "rule_receivable_cash", "1111", "Debit", "Amount", "Thu công nợ tiền mặt");
        await UpsertRuleLine("line_receivable_cash_credit", "rule_receivable_cash", "131", "Credit", "Amount", "Thu hồi công nợ phải thu");
        await UpsertRuleLine("line_receivable_bank_debit", "rule_receivable_bank", "1121", "Debit", "Amount", "Thu công nợ qua ngân hàng/cổng thanh toán");
        await UpsertRuleLine("line_receivable_bank_credit", "rule_receivable_bank", "131", "Credit", "Amount", "Thu hồi công nợ phải thu");
        await UpsertRuleLine("line_postpaid_debit", "rule_booking_postpaid", "131", "Debit", "OutstandingAmount", "Ghi nhận nợ phải thu");
        await UpsertRuleLine("line_postpaid_credit", "rule_booking_postpaid", "5111", "Credit", "OutstandingAmount", "Doanh thu treo ghi nợ");
        await db.SaveChangesAsync(cancellationToken);

        var customers = await db.Customers.ToListAsync(cancellationToken);
        foreach (var customer in customers)
        {
            if (string.IsNullOrEmpty(customer.BusinessPartnerId))
            {
                var partner = await db.BusinessPartners.FirstOrDefaultAsync(x => x.PartnerCode == "KH_" + customer.Phone, cancellationToken);
                if (partner is null)
                {
                    partner = new BusinessPartner
                    {
                        Id = Guid.NewGuid().ToString("N"),
                        PartnerCode = "KH_" + customer.Phone,
                        PartnerName = customer.CustomerName,
                        PartnerType = "Customer",
                        PhoneNumber = customer.Phone,
                        Address = "Địa chỉ mẫu tại Việt Nam"
                    };
                    db.BusinessPartners.Add(partner);
                    await db.SaveChangesAsync(cancellationToken);
                }

                customer.BusinessPartnerId = partner.Id;
                db.Customers.Update(customer);
            }
        }
        await db.SaveChangesAsync(cancellationToken);

        var sampleCustomer = customers.FirstOrDefault(x => x.Phone == "0902222222");
        if (sampleCustomer is not null && !string.IsNullOrEmpty(sampleCustomer.BusinessPartnerId))
        {
            var exists = await db.AccountReceivables.AnyAsync(x => x.PartnerId == sampleCustomer.BusinessPartnerId, cancellationToken);
            if (!exists)
            {
                db.AccountReceivables.Add(new AccountReceivable
                {
                    Id = Guid.NewGuid().ToString("N"),
                    PartnerId = sampleCustomer.BusinessPartnerId,
                    OriginalAmount = 1000000m,
                    PaidAmount = 700000m,
                    OutstandingAmount = 300000m,
                    DueDate = DateTime.Today.AddDays(7),
                    Status = "Partially_Paid"
                });
                await db.SaveChangesAsync(cancellationToken);
            }
        }

        var entryExists = await db.JournalEntries.AnyAsync(cancellationToken);
        if (!entryExists)
        {
            var entry1 = new JournalEntry
            {
                Id = "seeding_entry_1",
                VoucherNo = "PT-2026-00001",
                EntryDate = DateTime.Today.AddDays(-1),
                DocumentType = "PT",
                SourceTable = "Payments",
                SourceId = "seeding_payment_1",
                Description = "Thu tiền đặt sân A01 — Nguyễn Văn An",
                Status = "Posted"
            };
            db.JournalEntries.Add(entry1);
            db.JournalEntryLines.Add(new JournalEntryLine { Id = "seeding_line_1_1", JournalEntryId = entry1.Id, AccountCode = "1111", DebitAmount = 540000m, CreditAmount = 0m, Description = "Thu tiền mặt" });
            db.JournalEntryLines.Add(new JournalEntryLine { Id = "seeding_line_1_2", JournalEntryId = entry1.Id, AccountCode = "5111", DebitAmount = 0m, CreditAmount = 540000m, Description = "Doanh thu thuê sân" });

            var entry2 = new JournalEntry
            {
                Id = "seeding_entry_2",
                VoucherNo = "PT-2026-00002",
                EntryDate = DateTime.Today.AddDays(-2),
                DocumentType = "PT",
                SourceTable = "Payments",
                SourceId = "seeding_payment_2",
                Description = "Thu cọc B01 — Trần Thị Bình",
                Status = "Posted"
            };
            db.JournalEntries.Add(entry2);
            db.JournalEntryLines.Add(new JournalEntryLine { Id = "seeding_line_2_1", JournalEntryId = entry2.Id, AccountCode = "1121", DebitAmount = 2400000m, CreditAmount = 0m, Description = "Chuyển khoản Vietcombank" });
            db.JournalEntryLines.Add(new JournalEntryLine { Id = "seeding_line_2_2", JournalEntryId = entry2.Id, AccountCode = "131", DebitAmount = 0m, CreditAmount = 2400000m, PartnerId = sampleCustomer?.BusinessPartnerId, Description = "Khách hàng trả trước cọc" });

            var entry3 = new JournalEntry
            {
                Id = "seeding_entry_3",
                VoucherNo = "PC-2026-00001",
                EntryDate = DateTime.Today.AddDays(-1),
                DocumentType = "PC",
                SourceTable = "Payments",
                SourceId = "seeding_payment_3",
                Description = "Chi mua nước uống canteen",
                Status = "Posted"
            };
            db.JournalEntries.Add(entry3);
            db.JournalEntryLines.Add(new JournalEntryLine { Id = "seeding_line_3_1", JournalEntryId = entry3.Id, AccountCode = "512", DebitAmount = 1280000m, CreditAmount = 0m, Description = "Chi phí mua hàng nước uống" });
            db.JournalEntryLines.Add(new JournalEntryLine { Id = "seeding_line_3_2", JournalEntryId = entry3.Id, AccountCode = "1111", DebitAmount = 0m, CreditAmount = 1280000m, Description = "Chi tiền mặt" });

            var entry4 = new JournalEntry
            {
                Id = "seeding_entry_4",
                VoucherNo = "PT-2026-00003",
                EntryDate = DateTime.Today,
                DocumentType = "PT",
                SourceTable = "Payments",
                SourceId = "seeding_payment_4",
                Description = "Thu tiền bán nước ca sáng (Nháp)",
                Status = "Draft"
            };
            db.JournalEntries.Add(entry4);
            db.JournalEntryLines.Add(new JournalEntryLine { Id = "seeding_line_4_1", JournalEntryId = entry4.Id, AccountCode = "1111", DebitAmount = 860000m, CreditAmount = 0m, Description = "Tiền mặt tạm tính" });
            db.JournalEntryLines.Add(new JournalEntryLine { Id = "seeding_line_4_2", JournalEntryId = entry4.Id, AccountCode = "512", DebitAmount = 0m, CreditAmount = 860000m, Description = "Doanh thu bán nước" });

            // Seed Suppliers
            var supplier1 = new BusinessPartner { Id = "supplier_thp", PartnerCode = "NCC-001", PartnerName = "Tân Hiệp Phát (Nước uống)", PartnerType = "Supplier", PhoneNumber = "0901111111", Address = "Bình Dương" };
            var supplier2 = new BusinessPartner { Id = "supplier_evn", PartnerCode = "NCC-002", PartnerName = "EVN — Điện lực Q.7", PartnerType = "Supplier", PhoneNumber = "0902222222", Address = "Quận 7, TP. HCM" };
            var supplier3 = new BusinessPartner { Id = "supplier_sawaco", PartnerCode = "NCC-003", PartnerName = "Sawaco — Nước sạch", PartnerType = "Supplier", PhoneNumber = "0903333333", Address = "Quận 3, TP. HCM" };
            var supplier4 = new BusinessPartner { Id = "supplier_yonex", PartnerCode = "NCC-004", PartnerName = "Yonex Vietnam (Vợt, cầu)", PartnerType = "Supplier", PhoneNumber = "0904444444", Address = "Hà Nội" };
            var supplier5 = new BusinessPartner { Id = "supplier_clean", PartnerCode = "NCC-005", PartnerName = "Cty Vệ sinh Saigon Clean", PartnerType = "Supplier", PhoneNumber = "0905555555", Address = "Bình Thạnh, TP. HCM" };
            var supplier6 = new BusinessPartner { Id = "supplier_hoasen", PartnerCode = "NCC-006", PartnerName = "Hoa Sen (Vật tư bảo trì)", PartnerType = "Supplier", PhoneNumber = "0906666666", Address = "Bình Dương" };

            db.BusinessPartners.AddRange(new[] { supplier1, supplier2, supplier3, supplier4, supplier5, supplier6 });

            // Supplier 1: Tân Hiệp Phát (Mua nước 14.2M, Trả 8.4M)
            var entry5 = new JournalEntry { Id = "seeding_entry_5", VoucherNo = "HD-2026-00001", EntryDate = DateTime.Today.AddDays(-5), DocumentType = "HD", Description = "Mua nước đóng chai Yonex/THP", Status = "Posted" };
            db.JournalEntries.Add(entry5);
            db.JournalEntryLines.Add(new JournalEntryLine { Id = "seeding_line_5_1", JournalEntryId = entry5.Id, AccountCode = "642", DebitAmount = 14200000m, CreditAmount = 0m, Description = "Chi phí nước uống" });
            db.JournalEntryLines.Add(new JournalEntryLine { Id = "seeding_line_5_2", JournalEntryId = entry5.Id, AccountCode = "331", DebitAmount = 0m, CreditAmount = 14200000m, PartnerId = supplier1.Id, Description = "Phải trả Tân Hiệp Phát" });

            var entry6 = new JournalEntry { Id = "seeding_entry_6", VoucherNo = "PC-2026-00002", EntryDate = DateTime.Today.AddDays(-4), DocumentType = "PC", Description = "Trả tiền nước Tân Hiệp Phát", Status = "Posted" };
            db.JournalEntries.Add(entry6);
            db.JournalEntryLines.Add(new JournalEntryLine { Id = "seeding_line_6_1", JournalEntryId = entry6.Id, AccountCode = "331", DebitAmount = 8400000m, CreditAmount = 0m, PartnerId = supplier1.Id, Description = "Thanh toán một phần công nợ" });
            db.JournalEntryLines.Add(new JournalEntryLine { Id = "seeding_line_6_2", JournalEntryId = entry6.Id, AccountCode = "1121", DebitAmount = 0m, CreditAmount = 8400000m, Description = "Chuyển khoản thanh toán" });

            // Supplier 2: EVN Q.7 (Tiền điện 8.4M, Trả 4.2M)
            var entry7 = new JournalEntry { Id = "seeding_entry_7", VoucherNo = "HD-2026-00002", EntryDate = DateTime.Today.AddDays(-4), DocumentType = "HD", Description = "Hoá đơn tiền điện tháng 5 ca 1+2", Status = "Posted" };
            db.JournalEntries.Add(entry7);
            db.JournalEntryLines.Add(new JournalEntryLine { Id = "seeding_line_7_1", JournalEntryId = entry7.Id, AccountCode = "642", DebitAmount = 8400000m, CreditAmount = 0m, Description = "Chi phí tiền điện" });
            db.JournalEntryLines.Add(new JournalEntryLine { Id = "seeding_line_7_2", JournalEntryId = entry7.Id, AccountCode = "331", DebitAmount = 0m, CreditAmount = 8400000m, PartnerId = supplier2.Id, Description = "Phải trả EVN" });

            var entry8 = new JournalEntry { Id = "seeding_entry_8", VoucherNo = "PC-2026-00003", EntryDate = DateTime.Today.AddDays(-3), DocumentType = "PC", Description = "Trả tiền điện tháng 5", Status = "Posted" };
            db.JournalEntries.Add(entry8);
            db.JournalEntryLines.Add(new JournalEntryLine { Id = "seeding_line_8_1", JournalEntryId = entry8.Id, AccountCode = "331", DebitAmount = 4200000m, CreditAmount = 0m, PartnerId = supplier2.Id, Description = "Thanh toán tiền điện" });
            db.JournalEntryLines.Add(new JournalEntryLine { Id = "seeding_line_8_2", JournalEntryId = entry8.Id, AccountCode = "1121", DebitAmount = 0m, CreditAmount = 4200000m, Description = "Chuyển khoản thanh toán" });

            // Supplier 3: Sawaco (Tiền nước 2.4M, chưa trả)
            var entry9 = new JournalEntry { Id = "seeding_entry_9", VoucherNo = "HD-2026-00003", EntryDate = DateTime.Today.AddDays(-2), DocumentType = "HD", Description = "Hoá đơn tiền nước sạch tháng 5", Status = "Posted" };
            db.JournalEntries.Add(entry9);
            db.JournalEntryLines.Add(new JournalEntryLine { Id = "seeding_line_9_1", JournalEntryId = entry9.Id, AccountCode = "642", DebitAmount = 2400000m, CreditAmount = 0m, Description = "Chi phí tiền nước" });
            db.JournalEntryLines.Add(new JournalEntryLine { Id = "seeding_line_9_2", JournalEntryId = entry9.Id, AccountCode = "331", DebitAmount = 0m, CreditAmount = 2400000m, PartnerId = supplier3.Id, Description = "Phải trả Sawaco" });

            // Supplier 4: Yonex (Mua vợt/cầu 32.6M, Trả 18M)
            var entry10 = new JournalEntry { Id = "seeding_entry_10", VoucherNo = "HD-2026-00004", EntryDate = DateTime.Today.AddDays(-6), DocumentType = "HD", Description = "Mua vợt, quả cầu lông tập luyện và bán lẻ", Status = "Posted" };
            db.JournalEntries.Add(entry10);
            db.JournalEntryLines.Add(new JournalEntryLine { Id = "seeding_line_10_1", JournalEntryId = entry10.Id, AccountCode = "642", DebitAmount = 32600000m, CreditAmount = 0m, Description = "Mua vật tư thể thao" });
            db.JournalEntryLines.Add(new JournalEntryLine { Id = "seeding_line_10_2", JournalEntryId = entry10.Id, AccountCode = "331", DebitAmount = 0m, CreditAmount = 32600000m, PartnerId = supplier4.Id, Description = "Phải trả Yonex" });

            var entry11 = new JournalEntry { Id = "seeding_entry_11", VoucherNo = "PC-2026-00004", EntryDate = DateTime.Today.AddDays(-4), DocumentType = "PC", Description = "Chuyển khoản đặt cọc Yonex", Status = "Posted" };
            db.JournalEntries.Add(entry11);
            db.JournalEntryLines.Add(new JournalEntryLine { Id = "seeding_line_11_1", JournalEntryId = entry11.Id, AccountCode = "331", DebitAmount = 18000000m, CreditAmount = 0m, PartnerId = supplier4.Id, Description = "Thanh toán công nợ Yonex" });
            db.JournalEntryLines.Add(new JournalEntryLine { Id = "seeding_line_11_2", JournalEntryId = entry11.Id, AccountCode = "1121", DebitAmount = 0m, CreditAmount = 18000000m, Description = "Chuyển khoản Vietcombank" });

            // Supplier 5: Saigon Clean (Phí vệ sinh 4.8M, Trả 2.4M)
            var entry12 = new JournalEntry { Id = "seeding_entry_12", VoucherNo = "HD-2026-00005", EntryDate = DateTime.Today.AddDays(-10), DocumentType = "HD", Description = "Dịch vụ vệ sinh công nghiệp trọn gói", Status = "Posted" };
            db.JournalEntries.Add(entry12);
            db.JournalEntryLines.Add(new JournalEntryLine { Id = "seeding_line_12_1", JournalEntryId = entry12.Id, AccountCode = "642", DebitAmount = 4800000m, CreditAmount = 0m, Description = "Chi phí vệ sinh" });
            db.JournalEntryLines.Add(new JournalEntryLine { Id = "seeding_line_12_2", JournalEntryId = entry12.Id, AccountCode = "331", DebitAmount = 0m, CreditAmount = 4800000m, PartnerId = supplier5.Id, Description = "Phải trả Saigon Clean" });

            var entry13 = new JournalEntry { Id = "seeding_entry_13", VoucherNo = "PC-2026-00005", EntryDate = DateTime.Today.AddDays(-8), DocumentType = "PC", Description = "Thanh toán đợt 1 dịch vụ vệ sinh", Status = "Posted" };
            db.JournalEntries.Add(entry13);
            db.JournalEntryLines.Add(new JournalEntryLine { Id = "seeding_line_13_1", JournalEntryId = entry13.Id, AccountCode = "331", DebitAmount = 2400000m, CreditAmount = 0m, PartnerId = supplier5.Id, Description = "Trả tiền Saigon Clean" });
            db.JournalEntryLines.Add(new JournalEntryLine { Id = "seeding_line_13_2", JournalEntryId = entry13.Id, AccountCode = "1111", DebitAmount = 0m, CreditAmount = 2400000m, Description = "Chi tiền mặt" });

            // Supplier 6: Hoa Sen (Mua thép rào sân 12.4M, Trả 8.4M)
            var entry14 = new JournalEntry { Id = "seeding_entry_14", VoucherNo = "HD-2026-00006", EntryDate = DateTime.Today.AddDays(-15), DocumentType = "HD", Description = "Vật tư xây dựng & sửa chữa lưới rào", Status = "Posted" };
            db.JournalEntries.Add(entry14);
            db.JournalEntryLines.Add(new JournalEntryLine { Id = "seeding_line_14_1", JournalEntryId = entry14.Id, AccountCode = "642", DebitAmount = 12400000m, CreditAmount = 0m, Description = "Chi phí sửa chữa TSCĐ" });
            db.JournalEntryLines.Add(new JournalEntryLine { Id = "seeding_line_14_2", JournalEntryId = entry14.Id, AccountCode = "331", DebitAmount = 0m, CreditAmount = 12400000m, PartnerId = supplier6.Id, Description = "Phải trả Thép Hoa Sen" });

            var entry15 = new JournalEntry { Id = "seeding_entry_15", VoucherNo = "PC-2026-00006", EntryDate = DateTime.Today.AddDays(-12), DocumentType = "PC", Description = "Trả tiền sắt thép Hoa Sen", Status = "Posted" };
            db.JournalEntries.Add(entry15);
            db.JournalEntryLines.Add(new JournalEntryLine { Id = "seeding_line_15_1", JournalEntryId = entry15.Id, AccountCode = "331", DebitAmount = 8400000m, CreditAmount = 0m, PartnerId = supplier6.Id, Description = "Trả tiền Hoa Sen" });
            db.JournalEntryLines.Add(new JournalEntryLine { Id = "seeding_line_15_2", JournalEntryId = entry15.Id, AccountCode = "1121", DebitAmount = 0m, CreditAmount = 8400000m, Description = "Chuyển khoản thanh toán" });

            await db.SaveChangesAsync(cancellationToken);
        }
    }
}

