using Microsoft.EntityFrameworkCore;
using CourtManagementBE.Domain.Entities;
using CourtManagementBE.Domain.Enums;

namespace CourtManagementBE.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  DbSets
    // ══════════════════════════════════════════════════════════════════════════

    // ── Auth ──────────────────────────────────────────────────────────────────
    public DbSet<User> Users => Set<User>();
    public DbSet<UserToken> UserTokens => Set<UserToken>();

    // ── Cơ sở ────────────────────────────────────────────────────────────────
    public DbSet<Facilities> Facilities => Set<Facilities>();

    // ── Khu vực & Sân ─────────────────────────────────────────────────────────
    public DbSet<Areas> Areas => Set<Areas>();
    public DbSet<Courts> Courts => Set<Courts>();
    public DbSet<CourtTypes> CourtTypes => Set<CourtTypes>();
    public DbSet<CourtStatus> CourtStatuses => Set<CourtStatus>();
    public DbSet<CourtFeatures> CourtFeatures => Set<CourtFeatures>();
    public DbSet<CourtFeatureMappings> CourtFeatureMappings => Set<CourtFeatureMappings>();
    public DbSet<CourtAssets> CourtAssets => Set<CourtAssets>();
    public DbSet<CourtAreaMapping> CourtAreaMappings => Set<CourtAreaMapping>();
    public DbSet<CourtUtilities> CourtUtilities => Set<CourtUtilities>();
    public DbSet<Utilities> Utilities => Set<Utilities>();

    // ── Giá sân ───────────────────────────────────────────────────────────────
    public DbSet<PriceRuleTypes> PriceRuleTypes => Set<PriceRuleTypes>();
    public DbSet<CourtDefaultPriceRule> CourtDefaultPriceRules => Set<CourtDefaultPriceRule>();
    public DbSet<CourtPriceRule> CourtPriceRules => Set<CourtPriceRule>();
    public DbSet<CourtPriceRuleHistory> CourtPriceRuleHistories => Set<CourtPriceRuleHistory>();
    public DbSet<CourtLockedSlot> CourtLockedSlots => Set<CourtLockedSlot>();

    // ── Đặt sân ───────────────────────────────────────────────────────────────
    public DbSet<Customers> Customers => Set<Customers>();
    public DbSet<BookingGroups> BookingGroups => Set<BookingGroups>();
    public DbSet<RecurringConfigs> RecurringConfigs => Set<RecurringConfigs>();
    public DbSet<Bookings> Bookings => Set<Bookings>();
    public DbSet<BookingSlots> BookingSlots => Set<BookingSlots>();
    public DbSet<BookingServices> BookingServices => Set<BookingServices>();
    public DbSet<BookingCombos> BookingCombos => Set<BookingCombos>();
    public DbSet<Payments> Payments => Set<Payments>();
    public DbSet<BookingHistories> BookingHistories => Set<BookingHistories>();
    public DbSet<BookingStatuses> BookingStatuses => Set<BookingStatuses>();

    // ── Dịch vụ ───────────────────────────────────────────────────────────────
    public DbSet<Services> Services => Set<Services>();
    public DbSet<Combos> Combos => Set<Combos>();
    public DbSet<ComboServices> ComboServices => Set<ComboServices>();

    public DbSet<PaymentStatuses> PaymentStatuses => Set<PaymentStatuses>();
    public DbSet<PaymentMethods> PaymentMethods => Set<PaymentMethods>();
    public DbSet<CustomerTypes> CustomerTypes => Set<CustomerTypes>();
    public DbSet<ServiceTypes> ServiceTypes => Set<ServiceTypes>();
    public DbSet<Units> Units => Set<Units>();
    public DbSet<UnitConversions> UnitConversions => Set<UnitConversions>();
    public DbSet<AssetCategories> AssetCategories => Set<AssetCategories>();
    public DbSet<AssetConditions> AssetConditions => Set<AssetConditions>();
    public DbSet<CourtFeatureCategories> CourtFeatureCategories => Set<CourtFeatureCategories>();
    public DbSet<CancellationReasons> CancellationReasons => Set<CancellationReasons>();
    public DbSet<RefundReasons> RefundReasons => Set<RefundReasons>();
    public DbSet<SystemSettings> SystemSettings => Set<SystemSettings>();

    // ── Audit Log ─────────────────────────────────────────────────────────────
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    // ── Idempotency / Idempotency Keys ──────────────────────────────────
    public DbSet<IdempotencyKey> IdempotencyKeys => Set<IdempotencyKey>();



    // ══════════════════════════════════════════════════════════════════════════
    //  Fluent API Configuration
    // ══════════════════════════════════════════════════════════════════════════
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ── User ─────────────────────────────────────────────────────────────
        modelBuilder.Entity<User>(e =>
        {
            e.Property(x => x.Email).HasColumnType("varchar(255)").IsRequired();
            e.Property(x => x.PasswordHash).HasColumnType("varchar(500)").IsRequired();
            e.Property(x => x.FullName).HasColumnType("nvarchar(255)");
            e.Property(x => x.Role).HasColumnType("varchar(50)").HasDefaultValue("SuperAdmin");
            e.HasIndex(x => x.Email).IsUnique();
            e.HasIndex(x => x.FacilityID);
        });

        // ── UserToken ────────────────────────────────────────────────────────
        modelBuilder.Entity<UserToken>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Token).HasColumnType("varchar(500)").IsRequired();
            e.Property(x => x.TokenType).HasColumnType("varchar(50)").IsRequired();
            e.Property(x => x.UserId).HasColumnType("varchar(36)").IsRequired();
            e.HasIndex(x => x.Token);
        });

        // ── Facilities ───────────────────────────────────────────────────────
        modelBuilder.Entity<Facilities>(e =>
        {
            e.HasKey(x => x.FacilityID);
            e.Property(x => x.FacilityName).HasColumnType("nvarchar(200)").IsRequired();
            e.Property(x => x.Address).HasColumnType("nvarchar(500)");
            e.Property(x => x.Phone).HasColumnType("varchar(20)");
            e.Property(x => x.Email).HasColumnType("varchar(255)");
            e.Property(x => x.ImageURL).HasColumnType("nvarchar(500)");
            e.Property(x => x.Description).HasColumnType("nvarchar(1000)");
        });

        // ── Areas ────────────────────────────────────────────────────────────
        modelBuilder.Entity<Areas>(e =>
        {
            e.HasKey(x => x.AreaID);
            e.Property(x => x.AreaCode).HasColumnType("varchar(20)").IsRequired();
            e.Property(x => x.AreaName).HasColumnType("nvarchar(200)").IsRequired();
            e.Property(x => x.Description).HasColumnType("nvarchar(500)");
            e.HasIndex(x => new { x.FacilityID, x.AreaCode }).IsUnique();
        });

        // ── CourtTypes ───────────────────────────────────────────────────────
        modelBuilder.Entity<CourtTypes>(e =>
        {
            e.HasKey(x => x.CourtTypeID);
            e.Property(x => x.Code).HasColumnType("varchar(20)").IsRequired();
            e.Property(x => x.Name).HasColumnType("nvarchar(100)").IsRequired();
            e.Property(x => x.Description).HasColumnType("nvarchar(500)");
            e.HasIndex(x => x.Code).IsUnique();
        });

        // ── CourtStatus ──────────────────────────────────────────────────────
        modelBuilder.Entity<CourtStatus>(e =>
        {
            e.HasKey(x => x.StatusID);
            e.Property(x => x.StatusCode).HasColumnType("varchar(20)").IsRequired();
            e.Property(x => x.StatusName).HasColumnType("nvarchar(100)").IsRequired();
            e.Property(x => x.ColorCode).HasColumnType("varchar(10)");
            e.Property(x => x.Description).HasColumnType("nvarchar(500)");
            e.HasIndex(x => x.StatusCode).IsUnique();
        });

        modelBuilder.Entity<CourtFeatures>(e =>
        {
            e.HasKey(x => x.CourtFeatureID);
            e.Property(x => x.FeatureCode).HasColumnType("varchar(20)").IsRequired();
            e.Property(x => x.FeatureName).HasColumnType("nvarchar(100)").IsRequired();
            e.Property(x => x.Description).HasColumnType("nvarchar(500)");
            e.Property(x => x.CreatedBy).HasColumnType("varchar(100)");
            e.HasIndex(x => x.FeatureCode).IsUnique();
            e.HasOne(x => x.CourtFeatureCategory)
                .WithMany(x => x.CourtFeatures)
                .HasForeignKey(x => x.CourtFeatureCategoryID)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<CourtFeatureMappings>(e =>
        {
            e.HasKey(x => x.CourtFeatureMappingID);
            e.Property(x => x.CreatedBy).HasColumnType("varchar(100)");
            e.HasIndex(x => new { x.CourtID, x.CourtFeatureID }).IsUnique();
            e.HasOne(x => x.Court)
                .WithMany(x => x.CourtFeatureMappings)
                .HasForeignKey(x => x.CourtID)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.CourtFeature)
                .WithMany(x => x.CourtFeatureMappings)
                .HasForeignKey(x => x.CourtFeatureID)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<CourtAssets>(e =>
        {
            e.HasKey(x => x.CourtAssetID);
            e.Property(x => x.AssetCode).HasColumnType("varchar(30)").IsRequired();
            e.Property(x => x.AssetName).HasColumnType("nvarchar(200)").IsRequired();
            e.Property(x => x.Category).HasColumnType("varchar(50)");
            e.Property(x => x.Unit).HasColumnType("nvarchar(50)");
            e.Property(x => x.Condition).HasColumnType("varchar(30)");
            e.Property(x => x.PurchasePrice).HasColumnType("decimal(18,2)");
            e.Property(x => x.Note).HasColumnType("nvarchar(500)");
            e.Property(x => x.CreatedBy).HasColumnType("varchar(100)");
            e.Property(x => x.ModifiedBy).HasColumnType("varchar(100)");
            e.HasIndex(x => new { x.CourtID, x.AssetCode }).IsUnique();
            e.HasIndex(x => x.Category);
            e.HasIndex(x => x.Condition);

            e.HasOne(x => x.BaseUnit)
                .WithMany()
                .HasForeignKey(x => x.UnitID)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // ── Utilities ────────────────────────────────────────────────────────
        modelBuilder.Entity<Utilities>(e =>
        {
            e.HasKey(x => x.UtilityID);
            e.Property(x => x.UtilityCode).HasColumnType("varchar(20)").IsRequired();
            e.Property(x => x.UtilityName).HasColumnType("nvarchar(100)").IsRequired();
            e.Property(x => x.Icon).HasColumnType("varchar(100)");
            e.HasIndex(x => x.UtilityCode).IsUnique();
        });

        // ── Courts ───────────────────────────────────────────────────────────
        modelBuilder.Entity<Courts>(e =>
        {
            e.HasKey(x => x.CourtID);
            e.Property(x => x.CourtCode).HasColumnType("varchar(20)").IsRequired();
            e.Property(x => x.CourtName).HasColumnType("nvarchar(200)").IsRequired();
            e.Property(x => x.Description).HasColumnType("nvarchar(500)");
            e.Property(x => x.ImageURL).HasColumnType("nvarchar(500)");
            e.Property(x => x.Length).HasColumnType("float");
            e.Property(x => x.Width).HasColumnType("float");
            e.HasIndex(x => new { x.FacilityID, x.CourtCode }).IsUnique();
        });

        // ── CourtAreaMapping ─────────────────────────────────────────────────
        modelBuilder.Entity<CourtAreaMapping>(e =>
        {
            e.HasKey(x => x.CourtAreaMappingID);
            e.HasIndex(x => new { x.CourtID, x.AreaID }).IsUnique();
        });

        // ── CourtUtilities ───────────────────────────────────────────────────
        modelBuilder.Entity<CourtUtilities>(e =>
        {
            e.HasKey(x => x.CourtUtilitiesID);
            e.HasIndex(x => new { x.CourtID, x.UtilityID }).IsUnique();
        });

        // ── TimeSlots ────────────────────────────────────────────────────────
        modelBuilder.Entity<PriceRuleTypes>(e =>
        {
            e.HasKey(x => x.PriceRuleTypeID);
            e.Property(x => x.Code).HasColumnType("varchar(50)").IsRequired();
            e.Property(x => x.Name).HasColumnType("nvarchar(200)").IsRequired();
            e.Property(x => x.Description).HasColumnType("nvarchar(500)");
            e.Property(x => x.ColorCode).HasColumnType("varchar(10)");
            e.HasIndex(x => x.Code).IsUnique();
        });

        // ── CourtPriceByTimeSlot ─────────────────────────────────────────────
        modelBuilder.Entity<CourtDefaultPriceRule>(e =>
        {
            e.HasKey(x => x.CourtDefaultPriceRuleID);
            e.Property(x => x.Price).HasColumnType("decimal(18,2)");
            e.Property(x => x.CreatedBy).HasColumnType("varchar(100)");
            e.Property(x => x.UpdatedBy).HasColumnType("varchar(100)");
            e.HasIndex(x => new { x.DayOfWeek, x.StartTime, x.EndTime });
            e.HasIndex(x => x.PriceRuleTypeID);
        });

        modelBuilder.Entity<CourtPriceRule>(e =>
        {
            e.HasKey(x => x.CourtPriceRuleID);
            e.Property(x => x.Price).HasColumnType("decimal(18,2)");
            e.Property(x => x.CreatedBy).HasColumnType("varchar(100)");
            e.Property(x => x.UpdatedBy).HasColumnType("varchar(100)");
            // Unique: 1 sân + 1 slot + 1 ngày trong tuần chỉ có 1 giá
            e.HasIndex(x => new { x.CourtID, x.DayOfWeek, x.StartTime, x.EndTime });
            e.HasIndex(x => x.PriceRuleTypeID);
        });

        modelBuilder.Entity<CourtLockedSlot>(e =>
        {
            e.HasKey(x => x.CourtLockedSlotID);
            e.Property(x => x.SpecificDate).HasColumnType("date");
            e.Property(x => x.StartTime).HasColumnType("time(7)");
            e.Property(x => x.EndTime).HasColumnType("time(7)");
            e.Property(x => x.LockReason).HasColumnType("nvarchar(500)").IsRequired();
            e.Property(x => x.CreatedBy).HasColumnType("varchar(100)");
            e.Property(x => x.UpdatedBy).HasColumnType("varchar(100)");
            e.HasIndex(x => new { x.CourtID, x.IsWeekly, x.DayOfWeek, x.SpecificDate, x.StartTime, x.EndTime });
            e.HasIndex(x => x.IsActive);
            e.HasOne(x => x.Court)
                .WithMany(x => x.CourtLockedSlots)
                .HasForeignKey(x => x.CourtID)
                .OnDelete(DeleteBehavior.Cascade);
            e.ToTable(t =>
            {
                t.HasCheckConstraint("CK_CourtLockedSlots_DayOfWeek", "[DayOfWeek] IS NULL OR ([DayOfWeek] >= 0 AND [DayOfWeek] <= 6)");
                t.HasCheckConstraint("CK_CourtLockedSlots_DateMode", "([IsWeekly] = 1 AND [DayOfWeek] IS NOT NULL AND [SpecificDate] IS NULL) OR ([IsWeekly] = 0 AND [SpecificDate] IS NOT NULL AND [DayOfWeek] IS NULL)");
                t.HasCheckConstraint("CK_CourtLockedSlots_TimeRange", "[StartTime] < [EndTime]");
            });
        });

        // ── CourtPriceHistory ────────────────────────────────────────────────
        modelBuilder.Entity<CourtPriceRuleHistory>(e =>
        {
            e.HasKey(x => x.CourtPriceRuleHistoryID);
            e.Property(x => x.OldPrice).HasColumnType("decimal(18,2)");
            e.Property(x => x.NewPrice).HasColumnType("decimal(18,2)");
            e.Property(x => x.ChangedBy).HasColumnType("varchar(100)");
            e.Property(x => x.Reason).HasColumnType("nvarchar(500)");
            e.HasIndex(x => x.CourtPriceRuleID);
            e.HasIndex(x => x.CourtID);
        });

        // ── Customers ────────────────────────────────────────────────────────
        modelBuilder.Entity<Customers>(e =>
        {
            e.HasKey(x => x.CustomerID);
            e.Property(x => x.CustomerName).HasColumnType("nvarchar(200)").IsRequired();
            e.Property(x => x.Phone).HasColumnType("varchar(20)");
            e.Property(x => x.Email).HasColumnType("varchar(255)");
            e.Property(x => x.CustomerType).HasColumnType("varchar(20)").HasDefaultValue("normal");
            e.Property(x => x.Note).HasColumnType("nvarchar(500)");
            e.HasIndex(x => x.Phone);
        });

        // ── Bookings ─────────────────────────────────────────────────────────
        modelBuilder.Entity<Bookings>(e =>
        {
            e.HasKey(x => x.BookingID);
            e.Property(x => x.BookingID).HasColumnType("uniqueidentifier");
            e.Property(x => x.TotalAmount).HasColumnType("decimal(18,2)");
            e.Property(x => x.PaidAmount).HasColumnType("decimal(18,2)").HasDefaultValue(0);
            e.Property(x => x.Status)
                .HasColumnType("varchar(50)")
                .IsRequired();
            e.Property(x => x.CancellationReason).HasColumnType("nvarchar(500)");
            e.Property(x => x.Note).HasColumnType("nvarchar(500)");
            e.Property(x => x.BookingDate).HasColumnType("date");

            e.HasIndex(x => x.CustomerID);
            e.HasIndex(x => x.CourtID);
            e.HasIndex(x => x.BookingDate);

            e.HasOne(x => x.BookingGroup)
                .WithMany()
                .HasForeignKey(x => x.BookingGroupID)
                .OnDelete(DeleteBehavior.SetNull);

            e.HasOne(x => x.CancellationReasonNavigation)
                .WithMany()
                .HasForeignKey(x => x.CancellationReasonID)
                .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(x => x.Court)
                .WithMany()
                .HasForeignKey(x => x.CourtID)
                .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(x => x.Customer)
                .WithMany()
                .HasForeignKey(x => x.CustomerID)
                .OnDelete(DeleteBehavior.Restrict);

            e.HasMany(x => x.BookingSlots)
                .WithOne()
                .HasForeignKey(x => x.BookingID)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasMany(x => x.BookingServices)
                .WithOne()
                .HasForeignKey(x => x.BookingID)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasMany(x => x.BookingCombos)
                .WithOne()
                .HasForeignKey(x => x.BookingID)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ── BookingGroups ────────────────────────────────────────────────────
        modelBuilder.Entity<BookingGroups>(e =>
        {
            e.HasKey(x => x.BookingGroupID);
            e.Property(x => x.GroupType).HasColumnType("varchar(30)").IsRequired();
            e.Property(x => x.TotalAmount).HasColumnType("decimal(18,2)");
            e.Property(x => x.PaidAmount).HasColumnType("decimal(18,2)");
            e.Property(x => x.Status)
                .HasConversion(
                    v => v.ToString().ToLower(),
                    v => (BookingGroupStatus)Enum.Parse(typeof(BookingGroupStatus), v, true)
                )
                .HasColumnType("varchar(20)")
                .IsRequired();
            e.Property(x => x.Note).HasColumnType("nvarchar(500)");
            e.Property(x => x.CreatedBy).HasColumnType("varchar(100)");
            e.Property(x => x.ModifiedBy).HasColumnType("varchar(100)");
            e.HasIndex(x => x.CustomerID);
            e.HasIndex(x => x.FacilityID);

            e.HasOne(x => x.Customer)
                .WithMany()
                .HasForeignKey(x => x.CustomerID)
                .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(x => x.Facility)
                .WithMany()
                .HasForeignKey(x => x.FacilityID)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // ── RecurringConfigs ─────────────────────────────────────────────────
        modelBuilder.Entity<RecurringConfigs>(e =>
        {
            e.HasKey(x => x.BookingGroupID);
            e.Property(x => x.DaysOfWeek).HasColumnType("varchar(20)").IsRequired();
            e.Property(x => x.StartTime).HasColumnType("time(7)");
            e.Property(x => x.EndTime).HasColumnType("time(7)");
            e.Property(x => x.StartDate).HasColumnType("date");
            e.Property(x => x.EndDate).HasColumnType("date");

            // 1-to-1 Relationship with BookingGroups
            e.HasOne(x => x.BookingGroup)
                .WithOne(x => x.RecurringConfig)
                .HasForeignKey<RecurringConfigs>(x => x.BookingGroupID)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(x => x.Court)
                .WithMany()
                .HasForeignKey(x => x.CourtID)
                .OnDelete(DeleteBehavior.Restrict); // Prevent deleting courts with active configurations
        });

        // ── BookingSlots ─────────────────────────────────────────────────────
        modelBuilder.Entity<BookingSlots>(e =>
        {
            e.HasKey(x => x.ID);
            e.Property(x => x.BookingID).HasColumnType("uniqueidentifier");
            e.Property(x => x.BookingDate).HasColumnType("date");
            // Unique: 1 sân + 1 ngày + 1 slot chỉ được đặt 1 lần
            e.HasIndex(x => new { x.CourtID, x.BookingDate, x.StartTime, x.EndTime }).IsUnique();
        });

        // ── BookingServices ──────────────────────────────────────────────────
        modelBuilder.Entity<BookingServices>(e =>
        {
            e.HasKey(x => x.BookingServiceID);
            e.Property(x => x.BookingID).HasColumnType("uniqueidentifier");
            e.Property(x => x.UnitPrice).HasColumnType("decimal(18,2)");
            e.Property(x => x.TotalAmount).HasColumnType("decimal(18,2)");
        });

        // ── BookingCombos ────────────────────────────────────────────────────
        modelBuilder.Entity<BookingCombos>(e =>
        {
            e.HasKey(x => x.BookingComboID);
            e.Property(x => x.BookingID).HasColumnType("uniqueidentifier");
            e.Property(x => x.UnitPrice).HasColumnType("decimal(18,2)");
            e.Property(x => x.TotalAmount).HasColumnType("decimal(18,2)");
        });

        // ── Payments ─────────────────────────────────────────────────────────
        modelBuilder.Entity<Payments>(e =>
        {
            e.HasKey(x => x.PaymentID);
            e.Property(x => x.BookingID).HasColumnType("uniqueidentifier").IsRequired(false);
            e.Property(x => x.BookingGroupID).HasColumnType("int").IsRequired(false);
            e.Property(x => x.Amount).HasColumnType("decimal(18,2)");
            e.Property(x => x.RefundedAmount).HasColumnType("decimal(18,2)");
            e.Property(x => x.PaymentMethod).HasColumnType("varchar(30)");
            e.Property(x => x.Status).HasColumnType("varchar(20)");
            e.Property(x => x.Note).HasColumnType("nvarchar(300)");
            
            e.HasIndex(x => x.BookingID);
            e.HasIndex(x => x.BookingGroupID);

            e.HasOne(x => x.BookingGroup)
                .WithMany()
                .HasForeignKey(x => x.BookingGroupID)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // ── Services ─────────────────────────────────────────────────────────
        modelBuilder.Entity<Services>(e =>
        {
            e.HasKey(x => x.ServiceID);
            e.Property(x => x.ServiceCode).HasColumnType("varchar(20)").IsRequired();
            e.Property(x => x.ServiceName).HasColumnType("nvarchar(200)").IsRequired();
            e.Property(x => x.Price).HasColumnType("decimal(18,2)");
            e.Property(x => x.IsTrackStock).HasDefaultValue(false);
            e.Property(x => x.StockQuantity).HasDefaultValue(0);
            e.HasIndex(x => new { x.FacilityID, x.ServiceCode }).IsUnique();

            e.HasOne(x => x.ServiceType)
                .WithMany()
                .HasForeignKey(x => x.ServiceTypeID)
                .OnDelete(DeleteBehavior.SetNull);

            e.HasOne(x => x.BaseUnit)
                .WithMany()
                .HasForeignKey(x => x.UnitID)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // ── Combos & ComboServices ───────────────────────────────────────────
        modelBuilder.Entity<Combos>(e =>
        {
            e.HasKey(x => x.ComboID);
            e.Property(x => x.ComboCode).HasColumnType("varchar(50)").IsRequired();
            e.Property(x => x.ComboName).HasColumnType("nvarchar(200)").IsRequired();
            e.Property(x => x.Description).HasColumnType("nvarchar(500)");
            e.Property(x => x.ComboPrice).HasColumnType("decimal(18,2)");
            e.HasIndex(x => x.ComboCode).IsUnique();
        });

        modelBuilder.Entity<ComboServices>(e =>
        {
            e.HasKey(x => x.ID);
            e.HasOne(x => x.Combo)
                .WithMany()
                .HasForeignKey(x => x.ComboID)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Service)
                .WithMany()
                .HasForeignKey(x => x.ServiceID)
                .OnDelete(DeleteBehavior.Cascade);
        });

        ConfigureMasterData<PaymentStatuses>(modelBuilder, "PaymentStatusID");
        ConfigureMasterData<PaymentMethods>(modelBuilder, "PaymentMethodID");
        ConfigureMasterData<CustomerTypes>(modelBuilder, "CustomerTypeID");
        modelBuilder.Entity<CustomerTypes>(e =>
        {
            e.Property(x => x.DiscountPercent).HasColumnType("decimal(5,2)");
        });
        ConfigureMasterData<ServiceTypes>(modelBuilder, "ServiceTypeID");
        ConfigureMasterData<Units>(modelBuilder, "UnitID");
        ConfigureMasterData<AssetCategories>(modelBuilder, "AssetCategoryID");
        ConfigureMasterData<AssetConditions>(modelBuilder, "AssetConditionID");
        ConfigureMasterData<CourtFeatureCategories>(modelBuilder, "CourtFeatureCategoryID");
        ConfigureMasterData<CancellationReasons>(modelBuilder, "CancellationReasonID");
        ConfigureMasterData<RefundReasons>(modelBuilder, "RefundReasonID");

        // ── AuditLog ─────────────────────────────────────────────────────────
        modelBuilder.Entity<AuditLog>(e =>
        {
            e.HasKey(x => x.AuditLogID);
            e.Property(x => x.TableName).HasColumnType("varchar(100)").IsRequired();
            e.Property(x => x.Action).HasColumnType("varchar(10)").IsRequired();
            e.Property(x => x.RecordID).HasColumnType("varchar(100)");
            e.Property(x => x.OldValues).HasColumnType("nvarchar(max)");
            e.Property(x => x.NewValues).HasColumnType("nvarchar(max)");
            e.Property(x => x.AffectedColumns).HasColumnType("nvarchar(max)");
            e.Property(x => x.PerformedBy).HasColumnType("varchar(100)");
            e.Property(x => x.IPAddress).HasColumnType("varchar(45)");  // support IPv6
            // Index giúp query log nhanh theo bảng hoặc actor
            e.HasIndex(x => x.TableName);
            e.HasIndex(x => x.PerformedBy);
            e.HasIndex(x => x.CreatedAt);
        });

        // ── BookingHistories ──────────────────────────────────────────────────
        modelBuilder.Entity<BookingHistories>(e =>
        {
            e.HasKey(x => x.BookingHistoryID);
            e.Property(x => x.Action).HasColumnType("varchar(50)").IsRequired();
            e.Property(x => x.OldValue).HasColumnType("nvarchar(max)");
            e.Property(x => x.NewValue).HasColumnType("nvarchar(max)");
            e.Property(x => x.Note).HasColumnType("nvarchar(500)");
            e.Property(x => x.PerformedBy).HasColumnType("varchar(100)");

            e.HasIndex(x => x.BookingID);
            e.HasIndex(x => x.CreatedAt);

            e.HasOne(x => x.Booking)
                .WithMany()
                .HasForeignKey(x => x.BookingID)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ── UnitConversions ──────────────────────────────────────────────────
        modelBuilder.Entity<UnitConversions>(e =>
        {
            e.HasKey(x => x.UnitConversionID);
            e.Property(x => x.Factor).HasColumnType("decimal(18,4)").IsRequired();

            e.HasOne(x => x.Service)
                .WithMany(x => x.UnitConversions)
                .HasForeignKey(x => x.ServiceID)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(x => x.SourceUnit)
                .WithMany()
                .HasForeignKey(x => x.SourceUnitID)
                .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(x => x.TargetUnit)
                .WithMany()
                .HasForeignKey(x => x.TargetUnitID)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // ── BookingStatuses ──────────────────────────────────────────────────
        modelBuilder.Entity<BookingStatuses>(e =>
        {
            e.HasKey(x => x.BookingStatusID);
            e.Property(x => x.Code).HasColumnType("varchar(50)").IsRequired();
            e.Property(x => x.StatusName).HasColumnType("varchar(100)").IsRequired();
            e.Property(x => x.LabelName).HasColumnType("nvarchar(200)").IsRequired();
            e.Property(x => x.ColorCode).HasColumnType("varchar(20)");
            e.HasIndex(x => x.Code).IsUnique();
        });

        // ── SystemSettings ───────────────────────────────────────────────────
        modelBuilder.Entity<SystemSettings>(e =>
        {
            e.HasKey(x => x.ID);
            e.Property(x => x.Timezone).HasColumnType("varchar(50)").HasDefaultValue("Asia/Ho_Chi_Minh").IsRequired();
            e.Property(x => x.CancellationFeePercent).HasColumnType("decimal(5,2)").HasDefaultValue(20.0m);
        });

        // ── Idempotency / Idempotency Keys ──────────────────────────────────
        modelBuilder.Entity<IdempotencyKey>(e =>
        {
            e.HasKey(x => x.Key);
            e.Property(x => x.Key).HasColumnType("varchar(250)").IsRequired();
            e.Property(x => x.RequestHash).HasColumnType("varchar(64)").IsRequired();
            e.Property(x => x.ResponseContent).HasColumnType("nvarchar(max)").IsRequired();
            e.Property(x => x.CreatedAt).HasColumnType("datetimeoffset").IsRequired();
        });
    }

    private static void ConfigureMasterData<T>(ModelBuilder modelBuilder, string keyName)
        where T : MasterDataBase
    {
        modelBuilder.Entity<T>(e =>
        {
            e.HasKey(keyName);
            e.Property(x => x.Code).HasColumnType("varchar(50)").IsRequired();
            e.Property(x => x.Name).HasColumnType("nvarchar(200)").IsRequired();
            e.Property(x => x.Description).HasColumnType("nvarchar(500)");
            e.HasIndex(x => x.Code).IsUnique();
        });
    }
}
