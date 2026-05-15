using CourtManagementBE.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CourtManagementBE.Infrastructure.Data;

public static class AppDbSeeder
{
    private const string AdminLogin = "admin";
    private const string AdminPassword = "admin";

    public static async Task SeedAsync(AppDbContext db, CancellationToken cancellationToken = default)
    {
        await SeedAdminAsync(db, cancellationToken);

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
        var timeSlots = await GetOrCreateTimeSlotsAsync(db, cancellationToken);
        var services = await GetOrCreateServicesAsync(db, cancellationToken);
        var customers = await GetOrCreateCustomersAsync(db, cancellationToken);

        await SeedCourtAreaMappingsAsync(db, courts, areas, cancellationToken);
        await SeedCourtFeatureMappingsAsync(db, courts, courtFeatures, cancellationToken);
        await SeedCourtUtilitiesAsync(db, courts, utilities, cancellationToken);
        await SeedCourtAssetsAsync(db, courts, cancellationToken);
        await SeedCourtPricesAsync(db, courts, timeSlots, cancellationToken);
        await SeedServicePricesAsync(db, services, cancellationToken);
        await SeedBookingsAsync(db, courts, timeSlots, services, customers, cancellationToken);
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
            });

            await db.SaveChangesAsync(cancellationToken);
            return;
        }

        if (!BCrypt.Net.BCrypt.Verify(AdminPassword, admin.PasswordHash))
        {
            admin.PasswordHash = BCrypt.Net.BCrypt.HashPassword(AdminPassword);
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
            ImageURL = "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea",
            Description = "Seed facility for local development.",
            IsActive = true,
        };

        db.Facilities.Add(facility);
        await db.SaveChangesAsync(cancellationToken);
        return facility;
    }

    private static async Task<List<CourtTypes>> GetOrCreateCourtTypesAsync(
        AppDbContext db,
        CancellationToken cancellationToken)
    {
        var seed = new[]
        {
            new CourtTypes { Code = "BADMINTON", Name = "Badminton", Description = "Indoor badminton court" },
            new CourtTypes { Code = "TENNIS", Name = "Tennis", Description = "Standard tennis court" },
            new CourtTypes { Code = "PICKLEBALL", Name = "Pickleball", Description = "Pickleball court" },
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
            new CourtStatus { StatusCode = "available", StatusName = "Available", ColorCode = "#22c55e", Description = "Ready to book", CreatedBy = AdminLogin },
            new CourtStatus { StatusCode = "maintenance", StatusName = "Maintenance", ColorCode = "#f97316", Description = "Temporarily unavailable", CreatedBy = AdminLogin },
            new CourtStatus { StatusCode = "closed", StatusName = "Closed", ColorCode = "#64748b", Description = "Closed for operation", CreatedBy = AdminLogin },
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
        var seed = new[]
        {
            new CourtFeatures { FeatureCode = "INDOOR", FeatureName = "Indoor", Category = "Environment", Description = "Indoor court", CreatedBy = AdminLogin },
            new CourtFeatures { FeatureCode = "OUTDOOR", FeatureName = "Outdoor", Category = "Environment", Description = "Outdoor court", CreatedBy = AdminLogin },
            new CourtFeatures { FeatureCode = "VIP", FeatureName = "VIP", Category = "Property", Description = "VIP court", CreatedBy = AdminLogin },
            new CourtFeatures { FeatureCode = "WOODEN_FLOOR", FeatureName = "Wooden Floor", Category = "Surface", Description = "Wooden floor surface", CreatedBy = AdminLogin },
            new CourtFeatures { FeatureCode = "AIR_CONDITIONED", FeatureName = "Air Conditioned", Category = "Environment", Description = "Court has air conditioning", CreatedBy = AdminLogin },
        };

        foreach (var item in seed)
        {
            if (!await db.CourtFeatures.AnyAsync(x => x.FeatureCode == item.FeatureCode, cancellationToken))
            {
                db.CourtFeatures.Add(item);
            }
            else
            {
                var existing = await db.CourtFeatures.FirstAsync(x => x.FeatureCode == item.FeatureCode, cancellationToken);
                if (string.IsNullOrWhiteSpace(existing.Category))
                {
                    existing.Category = item.Category;
                }
            }
        }

        await db.SaveChangesAsync(cancellationToken);

        var codes = seed.Select(x => x.FeatureCode).ToList();
        return await db.CourtFeatures.Where(x => codes.Contains(x.FeatureCode)).ToListAsync(cancellationToken);
    }

    private static async Task<List<Utilities>> GetOrCreateUtilitiesAsync(
        AppDbContext db,
        CancellationToken cancellationToken)
    {
        var seed = new[]
        {
            new Utilities { UtilityCode = "LIGHT", UtilityName = "Lighting", Description = "Night lighting", Icon = "bulb", CreatedBy = AdminLogin },
            new Utilities { UtilityCode = "PARKING", UtilityName = "Parking", Description = "Vehicle parking", Icon = "car", CreatedBy = AdminLogin },
            new Utilities { UtilityCode = "SHOWER", UtilityName = "Shower", Description = "Changing room and shower", Icon = "shower", CreatedBy = AdminLogin },
            new Utilities { UtilityCode = "WIFI", UtilityName = "Wi-Fi", Description = "Guest Wi-Fi", Icon = "wifi", CreatedBy = AdminLogin },
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
            new Areas { FacilityID = facilityId, AreaCode = "A", AreaName = "Zone A", TotalLength = 40, TotalWidth = 25, Description = "Main indoor zone" },
            new Areas { FacilityID = facilityId, AreaCode = "B", AreaName = "Zone B", TotalLength = 36, TotalWidth = 22, Description = "Secondary zone" },
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
            new Courts { FacilityID = facilityId, CourtTypeID = badminton.CourtTypeID, CourtCode = "A01", CourtName = "Badminton A01", StatusID = available.StatusID, Length = 13.4f, Width = 6.1f, Capacity = 4, SortOrder = 1, Description = "Indoor badminton court A01", CreatedBy = AdminLogin, ModifiedBy = AdminLogin },
            new Courts { FacilityID = facilityId, CourtTypeID = badminton.CourtTypeID, CourtCode = "A02", CourtName = "Badminton A02", StatusID = available.StatusID, Length = 13.4f, Width = 6.1f, Capacity = 4, SortOrder = 2, Description = "Indoor badminton court A02", CreatedBy = AdminLogin, ModifiedBy = AdminLogin },
            new Courts { FacilityID = facilityId, CourtTypeID = pickleball.CourtTypeID, CourtCode = "B01", CourtName = "Pickleball B01", StatusID = available.StatusID, Length = 13.4f, Width = 6.1f, Capacity = 4, SortOrder = 3, Description = "Pickleball court B01", CreatedBy = AdminLogin, ModifiedBy = AdminLogin },
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

    private static async Task<List<TimeSlots>> GetOrCreateTimeSlotsAsync(
        AppDbContext db,
        CancellationToken cancellationToken)
    {
        var seed = new[]
        {
            new TimeSlots { SlotName = "06:00 - 08:00", StartTime = new TimeSpan(6, 0, 0), EndTime = new TimeSpan(8, 0, 0), IsActive = true },
            new TimeSlots { SlotName = "08:00 - 10:00", StartTime = new TimeSpan(8, 0, 0), EndTime = new TimeSpan(10, 0, 0), IsActive = true },
            new TimeSlots { SlotName = "16:00 - 18:00", StartTime = new TimeSpan(16, 0, 0), EndTime = new TimeSpan(18, 0, 0), IsActive = true },
            new TimeSlots { SlotName = "18:00 - 20:00", StartTime = new TimeSpan(18, 0, 0), EndTime = new TimeSpan(20, 0, 0), IsActive = true },
        };

        foreach (var item in seed)
        {
            if (!await db.TimeSlots.AnyAsync(
                x => x.StartTime == item.StartTime && x.EndTime == item.EndTime,
                cancellationToken))
            {
                db.TimeSlots.Add(item);
            }
        }

        await db.SaveChangesAsync(cancellationToken);
        return await db.TimeSlots.ToListAsync(cancellationToken);
    }

    private static async Task<List<Services>> GetOrCreateServicesAsync(
        AppDbContext db,
        CancellationToken cancellationToken)
    {
        var seed = new[]
        {
            new Services { ServiceCode = "WATER", ServiceName = "Bottled Water", ServiceType = "drink", Unit = "bottle", MinQuantity = 1, MaxQuantity = 50, CreatedBy = AdminLogin, ModifiedBy = AdminLogin },
            new Services { ServiceCode = "RACKET", ServiceName = "Racket Rental", ServiceType = "rental", Unit = "racket", MinQuantity = 1, MaxQuantity = 10, CreatedBy = AdminLogin, ModifiedBy = AdminLogin },
            new Services { ServiceCode = "SHUTTLE", ServiceName = "Shuttlecock Tube", ServiceType = "equipment", Unit = "tube", MinQuantity = 1, MaxQuantity = 20, CreatedBy = AdminLogin, ModifiedBy = AdminLogin },
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
            new Customers { CustomerName = "Nguyen Van An", Phone = "0901111111", Email = "an@example.com", CustomerType = "member", Note = "Seed member customer" },
            new Customers { CustomerName = "Tran Thi Binh", Phone = "0902222222", Email = "binh@example.com", CustomerType = "vip", Note = "Seed VIP customer" },
            new Customers { CustomerName = "Le Minh Chau", Phone = "0903333333", Email = "chau@example.com", CustomerType = "normal", Note = "Seed normal customer" },
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
                new CourtAssets { CourtID = court.CourtID, AssetCode = $"{court.CourtCode}-NET", AssetName = "Net", Category = "Equipment", Quantity = 1, Unit = "piece", Condition = "Good", CreatedBy = AdminLogin, ModifiedBy = AdminLogin },
                new CourtAssets { CourtID = court.CourtID, AssetCode = $"{court.CourtCode}-LIGHT", AssetName = "Lighting Set", Category = "Lighting", Quantity = 1, Unit = "set", Condition = "Good", CreatedBy = AdminLogin, ModifiedBy = AdminLogin },
                new CourtAssets { CourtID = court.CourtID, AssetCode = $"{court.CourtCode}-BENCH", AssetName = "Player Bench", Category = "Furniture", Quantity = 2, Unit = "piece", Condition = "Good", CreatedBy = AdminLogin, ModifiedBy = AdminLogin },
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

    private static async Task SeedCourtPricesAsync(
        AppDbContext db,
        List<Courts> courts,
        List<TimeSlots> timeSlots,
        CancellationToken cancellationToken)
    {
        foreach (var court in courts)
        {
            foreach (var slot in timeSlots)
            {
                for (var dayOfWeek = 0; dayOfWeek <= 6; dayOfWeek++)
                {
                    if (await db.CourtPriceByTimeSlots.AnyAsync(
                        x => x.CourtID == court.CourtID
                            && x.TimeSlotID == slot.TimeSlotID
                            && x.DayOfWeek == dayOfWeek,
                        cancellationToken))
                    {
                        continue;
                    }

                    var isPrimeTime = slot.StartTime >= new TimeSpan(16, 0, 0);
                    var isWeekend = dayOfWeek is 0 or 6;
                    var price = 100_000m + (isPrimeTime ? 40_000m : 0m) + (isWeekend ? 30_000m : 0m);

                    db.CourtPriceByTimeSlots.Add(new CourtPriceByTimeSlot
                    {
                        CourtID = court.CourtID,
                        TimeSlotID = slot.TimeSlotID,
                        DayOfWeek = dayOfWeek,
                        Price = price,
                        IsActive = true,
                        CreatedBy = AdminLogin,
                    });
                }
            }
        }

        await db.SaveChangesAsync(cancellationToken);

        var priceSlot = await db.CourtPriceByTimeSlots.FirstOrDefaultAsync(cancellationToken);
        if (priceSlot is not null && !await db.CourtPriceHistories.AnyAsync(cancellationToken))
        {
            db.CourtPriceHistories.Add(new CourtPriceHistory
            {
                CourtPriceByTimeSlotID = priceSlot.ID,
                CourtID = priceSlot.CourtID,
                TimeSlotID = priceSlot.TimeSlotID,
                DayOfWeek = priceSlot.DayOfWeek,
                OldPrice = priceSlot.Price - 10_000m,
                NewPrice = priceSlot.Price,
                ChangedBy = AdminLogin,
                Reason = "Initial seed price adjustment",
            });
            await db.SaveChangesAsync(cancellationToken);
        }
    }

    private static async Task SeedServicePricesAsync(
        AppDbContext db,
        List<Services> services,
        CancellationToken cancellationToken)
    {
        var prices = new Dictionary<string, decimal>
        {
            ["WATER"] = 10_000m,
            ["RACKET"] = 30_000m,
            ["SHUTTLE"] = 120_000m,
        };

        foreach (var service in services)
        {
            if (!prices.TryGetValue(service.ServiceCode, out var price))
            {
                continue;
            }

            if (!await db.ServicePrices.AnyAsync(x => x.ServiceID == service.ServiceID && x.ExpiryDate == null, cancellationToken))
            {
                db.ServicePrices.Add(new ServicePrice
                {
                    ServiceID = service.ServiceID,
                    Price = price,
                    EffectiveDate = DateTimeOffset.UtcNow.Date,
                    ExpiryDate = null,
                    CreatedBy = AdminLogin,
                });
            }
        }

        await db.SaveChangesAsync(cancellationToken);
    }

    private static async Task SeedBookingsAsync(
        AppDbContext db,
        List<Courts> courts,
        List<TimeSlots> timeSlots,
        List<Services> services,
        List<Customers> customers,
        CancellationToken cancellationToken)
    {
        if (await db.Bookings.AnyAsync(cancellationToken)
            || courts.Count == 0
            || timeSlots.Count == 0
            || services.Count == 0
            || customers.Count == 0)
        {
            return;
        }

        var bookingDate = DateTime.Today.AddDays(1);
        var court = courts.OrderBy(x => x.SortOrder).First();
        var slot = timeSlots.OrderBy(x => x.StartTime).First();
        var customer = customers.First();
        var service = services.First(x => x.ServiceCode == "WATER");
        var servicePrice = await db.ServicePrices
            .Where(x => x.ServiceID == service.ServiceID && x.ExpiryDate == null)
            .Select(x => x.Price)
            .FirstOrDefaultAsync(cancellationToken);
        var courtPrice = await db.CourtPriceByTimeSlots
            .Where(x => x.CourtID == court.CourtID
                && x.TimeSlotID == slot.TimeSlotID
                && x.DayOfWeek == (int)bookingDate.DayOfWeek)
            .Select(x => x.Price)
            .FirstOrDefaultAsync(cancellationToken);
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
            Status = "confirmed",
            Note = "Seed booking",
            CreatedBy = AdminLogin,
            ModifiedBy = AdminLogin,
        });

        await db.SaveChangesAsync(cancellationToken);

        db.BookingSlots.Add(new BookingSlots
        {
            BookingID = bookingId,
            CourtID = court.CourtID,
            BookingDate = bookingDate,
            TimeSlotID = slot.TimeSlotID,
        });

        db.BookingServices.Add(new BookingServices
        {
            BookingID = bookingId,
            ServiceID = service.ServiceID,
            Quantity = serviceQuantity,
            UnitPrice = servicePrice,
            DiscountAmount = 0,
            TotalAmount = serviceTotal,
            Status = "confirmed",
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
            Note = "Seed payment",
            PaymentDate = DateTime.Today,
        });

        await db.SaveChangesAsync(cancellationToken);
    }
}
