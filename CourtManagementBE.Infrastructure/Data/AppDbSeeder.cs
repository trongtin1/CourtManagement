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
            OpeningTime = new TimeSpan(6, 0, 0),
            ClosingTime = new TimeSpan(22, 0, 0),
            SlotDurationMinutes = 60,
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
            new PriceRuleTypes { Code = "off_peak", Name = "Giờ thấp điểm", ColorCode = "#22c55e", SortOrder = 2 },
            new PriceRuleTypes { Code = "peak", Name = "Giờ cao điểm", ColorCode = "#f97316", SortOrder = 3 },
            new PriceRuleTypes { Code = "golden", Name = "Giờ vàng", ColorCode = "#eab308", SortOrder = 4 },
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
            new CancellationReasons { Code = "admin_cancelled", Name = "Quản trị viên huỷ", SortOrder = 4 },
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
            new Areas { FacilityID = facilityId, AreaCode = "A", AreaName = "Khu A", TotalLength = 40, TotalWidth = 25, Description = "Khu vực sân trong nhà chính" },
            new Areas { FacilityID = facilityId, AreaCode = "B", AreaName = "Khu B", TotalLength = 36, TotalWidth = 22, Description = "Khu vực sân ngoài trời" },
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
            new Courts { FacilityID = facilityId, CourtTypeID = badminton.CourtTypeID, CourtCode = "A01", CourtName = "Sân Cầu lông A01", StatusID = available.StatusID, Length = 13.4f, Width = 6.1f, Capacity = 4, SortOrder = 1, Description = "Sân cầu lông trong nhà Khu A01", CreatedBy = AdminLogin, ModifiedBy = AdminLogin },
            new Courts { FacilityID = facilityId, CourtTypeID = badminton.CourtTypeID, CourtCode = "A02", CourtName = "Sân Cầu lông A02", StatusID = available.StatusID, Length = 13.4f, Width = 6.1f, Capacity = 4, SortOrder = 2, Description = "Sân cầu lông trong nhà Khu A02", CreatedBy = AdminLogin, ModifiedBy = AdminLogin },
            new Courts { FacilityID = facilityId, CourtTypeID = pickleball.CourtTypeID, CourtCode = "B01", CourtName = "Sân Pickleball B01", StatusID = available.StatusID, Length = 13.4f, Width = 6.1f, Capacity = 4, SortOrder = 3, Description = "Sân pickleball Khu B01", CreatedBy = AdminLogin, ModifiedBy = AdminLogin },
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

        var bookingDate = DateTime.Today.AddDays(1);
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
            Note = "Đặt lịch mẫu",
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
            DiscountAmount = 0,
            TotalAmount = serviceTotal,
            CreatedBy = AdminLogin,
            ModifiedBy = AdminLogin,
        });

        db.Payments.Add(new Payments
        {
            BookingID = bookingId,
            Amount = courtPrice + serviceTotal,
            PaymentMethod = "cash",
            PaymentGateway = "Cash",
            TransactionID = $"SEED-{bookingDate:yyyyMMdd}-001",
            Status = "success",
            Note = "Thanh toán mẫu",
            PaymentDate = DateTime.Today,
        });

        await db.SaveChangesAsync(cancellationToken);
    }

    private static async Task SeedBookingStatusesAsync(AppDbContext db, CancellationToken cancellationToken)
    {
        var seed = new[]
        {
            new BookingStatuses { Code = "001", StatusName = "Pending", LabelName = "Chờ duyệt / Chờ cọc (Pending)", IsTerminal = false, CanReschedule = true, CanCombo = true, CanService = true, ColorCode = "warning" },
            new BookingStatuses { Code = "002", StatusName = "Confirmed", LabelName = "Đã xác nhận (Confirmed)", IsTerminal = false, CanReschedule = true, CanCombo = true, CanService = true, ColorCode = "processing" },
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
}
