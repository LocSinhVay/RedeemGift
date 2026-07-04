using DinkToPdf;
using DinkToPdf.Contracts;
using RedeemGiftAPI.Domain.BUS.Common;
using RedeemGiftAPI.Domain.BUS.CustomerSpin;
using RedeemGiftAPI.Domain.BUS.Dashboard;
using RedeemGiftAPI.Domain.BUS.EmailConfig;
using RedeemGiftAPI.Domain.BUS.Gift;
using RedeemGiftAPI.Domain.BUS.Helper;
using RedeemGiftAPI.Domain.BUS.Menu;
using RedeemGiftAPI.Domain.BUS.Prize;
using RedeemGiftAPI.Domain.BUS.Project;
using RedeemGiftAPI.Domain.BUS.RedeemSpin;
using RedeemGiftAPI.Domain.BUS.Role;
using RedeemGiftAPI.Domain.BUS.SystemUser;
using RedeemGiftAPI.Domain.DAO.CustomerSpin;
using RedeemGiftAPI.Domain.DAO.Dashboard;
using RedeemGiftAPI.Domain.DAO.EmailConfig;
using RedeemGiftAPI.Domain.DAO.Gift;
using RedeemGiftAPI.Domain.DAO.Menu;
using RedeemGiftAPI.Domain.DAO.Prize;
using RedeemGiftAPI.Domain.DAO.Project;
using RedeemGiftAPI.Domain.DAO.RedeemSpin;
using RedeemGiftAPI.Domain.DAO.Role;
using RedeemGiftAPI.Domain.DAO.SystemUser;
using RedeemGiftAPI.Services.Email;

namespace RedeemGiftAPI.Configuration
{
    public static class Configuration
    {
        public static void AddConfiguration(IServiceCollection services)
        {
            services.AddScoped<IProjectBUS, ProjectBUS>();
            services.AddScoped<IProjectDAO, ProjectDAO>();

            services.AddScoped<IDashboardBUS, DashboardBUS>();
            services.AddScoped<IDashboardDAO, DashboardDAO>();

            services.AddScoped<IGiftBUS, GiftBUS>();
            services.AddScoped<IGiftDAO, GiftDAO>();

            services.AddScoped<IRedeemSpinBUS, RedeemSpinBUS>();
            services.AddScoped<IRedeemSpinDAO, RedeemSpinDAO>();

            services.AddScoped<IPrizeBUS, PrizeBUS>();
            services.AddScoped<IPrizeDAO, PrizeDAO>();

            services.AddScoped<ICustomerSpinBUS, CustomerSpinBUS>();
            services.AddScoped<ICustomerSpinDAO, CustomerSpinDAO>();

            services.AddScoped<IMenuBUS, MenuBUS>();
            services.AddScoped<IMenuDAO, MenuDAO>();

            services.AddScoped<IRoleBUS, RoleBUS>();
            services.AddScoped<IRoleDAO, RoleDAO>();

            services.AddScoped<IRoleMenuBUS, RoleMenuBUS>();
            services.AddScoped<IRoleMenuDAO, RoleMenuDAO>();

            services.AddScoped<ISystemUserBUS, SystemUserBUS>();
            services.AddScoped<ISystemUserDAO, SystemUserDAO>();

            services.AddScoped<IEmailConfigBUS, EmailConfigBUS>();
            services.AddScoped<IEmailConfigDAO, EmailConfigDAO>();

            services.AddScoped<IEmailService, EmailService>();

            services.AddScoped<IFileBUS, FileBUS>();

            services.AddSingleton<IUploadFileHelper, UploadFileHelper>();

            services.AddSingleton<IConverter, SynchronizedConverter>(provider => new SynchronizedConverter(new PdfTools()));
        }
    }
}

