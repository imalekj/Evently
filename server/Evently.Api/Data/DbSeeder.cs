using Evently.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Evently.Api.Data;

public static class DbSeeder
{
    public const string AdminEmail = "admin@evently.com";
    public const string AdminPassword = "Admin@123";

    public static async Task SeedAsync(AppDbContext db)
    {
        var admin = await db.Users.FirstOrDefaultAsync(u => u.Email == AdminEmail);
        if (admin is null)
        {
            admin = new User
            {
                FullName = "Evently Admin",
                Email = AdminEmail,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(AdminPassword),
                Role = UserRole.Admin
            };
            db.Users.Add(admin);
            await db.SaveChangesAsync();
        }

        if (await db.Events.AnyAsync())
        {
            return;
        }

        var now = DateTime.UtcNow;
        DateTime InDays(int days, int hour) => new DateTime(now.Year, now.Month, now.Day, hour, 0, 0, DateTimeKind.Utc).AddDays(days);

        var events = new List<Event>
        {
            // Music (1)
            new() { Title = "حفل موسيقى الجاز الليلي", Description = "أمسية جاز هادئة مع أفضل العازفين المحليين في أجواء دافئة تحت أضواء المسرح.", CategoryId = 1, Location = "الكويت - قاعة الأوبرا", StartDate = InDays(12, 20), EndDate = InDays(12, 23), Price = 15, TotalTickets = 150, AvailableTickets = 150, ImageUrl = "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800" },
            new() { Title = "مهرجان الروك السنوي", Description = "أكبر تجمع لعشاق موسيقى الروك مع فرق محلية وعالمية على مدار يومين متتاليين.", CategoryId = 1, Location = "دبي - أرض المعارض", StartDate = InDays(40, 18), EndDate = InDays(41, 23), Price = 45, TotalTickets = 800, AvailableTickets = 800, ImageUrl = "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800" },

            // Technology (2)
            new() { Title = "مؤتمر الذكاء الاصطناعي 2026", Description = "أحدث التطورات في مجال الذكاء الاصطناعي وتطبيقاته العملية في الأعمال، بمشاركة خبراء عالميين.", CategoryId = 2, Location = "دبي - مركز المؤتمرات", StartDate = InDays(30, 9), EndDate = InDays(31, 17), Price = 120, TotalTickets = 400, AvailableTickets = 400, ImageUrl = "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800" },
            new() { Title = "هاكاثون المطورين", Description = "٤٨ ساعة من البرمجة والابتكار لبناء حلول تقنية جديدة، مع جوائز قيمة للفرق الفائزة.", CategoryId = 2, Location = "الكويت - مجمع الابتكار", StartDate = InDays(18, 9), EndDate = InDays(19, 21), Price = 0, TotalTickets = 200, AvailableTickets = 200, ImageUrl = "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800" },
            new() { Title = "معرض التقنيات الناشئة", Description = "استكشف أحدث الابتكارات في الواقع الافتراضي وإنترنت الأشياء والحوسبة السحابية.", CategoryId = 2, Location = "الدوحة - مركز المعارض", StartDate = InDays(55, 10), EndDate = InDays(57, 18), Price = 20, TotalTickets = 500, AvailableTickets = 500, ImageUrl = "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800" },

            // Sports (3)
            new() { Title = "بطولة كرة القدم الخماسية", Description = "بطولة مفتوحة للفرق الهاوية بجوائز نقدية وحضور جماهيري كبير.", CategoryId = 3, Location = "الكويت - نادي الرياضة", StartDate = InDays(15, 16), EndDate = InDays(15, 22), Price = 5, TotalTickets = 250, AvailableTickets = 250, ImageUrl = "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800" },
            new() { Title = "ماراثون المدينة السنوي", Description = "سباق جري لمسافة ٤٢ كم يجوب أهم معالم المدينة، مفتوح لجميع الفئات العمرية.", CategoryId = 3, Location = "الرياض - وسط المدينة", StartDate = InDays(60, 6), EndDate = InDays(60, 12), Price = 10, TotalTickets = 1000, AvailableTickets = 1000, ImageUrl = "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=800" },

            // Business (4)
            new() { Title = "قمة ريادة الأعمال", Description = "لقاء يجمع رواد الأعمال والمستثمرين لمناقشة فرص النمو والتمويل في المنطقة.", CategoryId = 4, Location = "دبي - برج الأعمال", StartDate = InDays(22, 9), EndDate = InDays(22, 17), Price = 75, TotalTickets = 300, AvailableTickets = 300, ImageUrl = "https://images.unsplash.com/photo-1560439514-4e9645039924?w=800" },
            new() { Title = "ورشة التسويق الرقمي", Description = "ورشة عملية لتعلم أساسيات التسويق عبر منصات التواصل الاجتماعي وتحليل البيانات.", CategoryId = 4, Location = "الكويت - مركز التدريب", StartDate = InDays(9, 10), EndDate = InDays(9, 15), Price = 30, TotalTickets = 80, AvailableTickets = 80, ImageUrl = "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800" },
            new() { Title = "منتدى الاستثمار العقاري", Description = "نظرة شاملة على فرص الاستثمار العقاري وأحدث المشاريع في المنطقة.", CategoryId = 4, Location = "أبوظبي - فندق الإمارات", StartDate = InDays(48, 9), EndDate = InDays(48, 16), Price = 50, TotalTickets = 200, AvailableTickets = 200, ImageUrl = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800" },

            // Arts & Culture (5)
            new() { Title = "معرض الفن التشكيلي المعاصر", Description = "مجموعة مختارة من أعمال فنانين محليين وعرب تعكس هوية المنطقة الثقافية.", CategoryId = 5, Location = "الكويت - المتحف الوطني", StartDate = InDays(14, 17), EndDate = InDays(20, 21), Price = 0, TotalTickets = 400, AvailableTickets = 400, ImageUrl = "https://images.unsplash.com/photo-1531058020387-3be344556be6?w=800" },
            new() { Title = "مهرجان الأفلام القصيرة", Description = "عروض لأفضل الأفلام القصيرة العربية والعالمية مع نقاشات مع صناعها.", CategoryId = 5, Location = "بيروت - سينما المدينة", StartDate = InDays(35, 18), EndDate = InDays(37, 23), Price = 12, TotalTickets = 250, AvailableTickets = 250, ImageUrl = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800" },
            new() { Title = "أمسية شعرية", Description = "أمسية أدبية تجمع نخبة من الشعراء لإلقاء قصائدهم أمام جمهور محب للأدب.", CategoryId = 5, Location = "عمّان - المركز الثقافي", StartDate = InDays(11, 19), EndDate = InDays(11, 22), Price = 0, TotalTickets = 120, AvailableTickets = 120, ImageUrl = "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800" },

            // Food & Drink (6)
            new() { Title = "مهرجان الطعام العالمي", Description = "أكشاك طعام من أكثر من ٣٠ دولة، وعروض طهي مباشرة مع أشهر الشيفات.", CategoryId = 6, Location = "دبي - الواجهة البحرية", StartDate = InDays(28, 16), EndDate = InDays(30, 23), Price = 8, TotalTickets = 1200, AvailableTickets = 1200, ImageUrl = "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800" },
            new() { Title = "ورشة تذوق القهوة المختصة", Description = "تعرف على رحلة حبة القهوة من المزرعة إلى الفنجان مع خبراء التحميص المحلي.", CategoryId = 6, Location = "الكويت - شارع القهوة", StartDate = InDays(7, 17), EndDate = InDays(7, 20), Price = 18, TotalTickets = 40, AvailableTickets = 40, ImageUrl = "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800" },
            new() { Title = "سوق المزارعين الأسبوعي", Description = "منتجات طازجة محلية مباشرة من المزارعين، ومأكولات صحية وأنشطة للعائلة.", CategoryId = 6, Location = "الرياض - حديقة المدينة", StartDate = InDays(6, 8), EndDate = InDays(6, 13), Price = 0, TotalTickets = 600, AvailableTickets = 600, ImageUrl = "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800" },

            // Education (7)
            new() { Title = "ورشة تطوير الذات", Description = "أدوات وتقنيات عملية لإدارة الوقت وبناء عادات إنتاجية مستدامة.", CategoryId = 7, Location = "الكويت - مركز التطوير", StartDate = InDays(16, 16), EndDate = InDays(16, 20), Price = 20, TotalTickets = 100, AvailableTickets = 100, ImageUrl = "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800" },
            new() { Title = "معسكر البرمجة للمبتدئين", Description = "برنامج تدريبي مكثف لتعلم أساسيات البرمجة وبناء أول مشروع تقني خلال أسبوع.", CategoryId = 7, Location = "دبي - أكاديمية التقنية", StartDate = InDays(45, 9), EndDate = InDays(49, 17), Price = 90, TotalTickets = 60, AvailableTickets = 60, ImageUrl = "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800" },

            // Other (8)
            new() { Title = "سوق المصنوعات اليدوية", Description = "معرض لمنتجات الحرفيين المحليين من مجوهرات وديكور ومنتجات مصنوعة يدوياً.", CategoryId = 8, Location = "الكويت - السوق المركزي", StartDate = InDays(10, 15), EndDate = InDays(12, 21), Price = 0, TotalTickets = 500, AvailableTickets = 500, ImageUrl = "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800" },
            new() { Title = "معرض السيارات الكلاسيكية", Description = "تشكيلة نادرة من السيارات الكلاسيكية والعتيقة مع مسابقات وجولات تجريبية.", CategoryId = 8, Location = "أبوظبي - أرض المعارض", StartDate = InDays(33, 10), EndDate = InDays(34, 20), Price = 15, TotalTickets = 350, AvailableTickets = 350, ImageUrl = "https://images.unsplash.com/photo-1493238792000-8113da705763?w=800" },
        };

        foreach (var ev in events)
        {
            ev.OrganizerId = admin.Id;
        }

        db.Events.AddRange(events);
        await db.SaveChangesAsync();
    }
}
