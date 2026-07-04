using System.Security.Cryptography;
using System.Text;

namespace RedeemGiftAPI.Domain.BUS.Helper
{
    public static class HashHelper
    {
        public static string ToSHA256(string password)
        {
            UnicodeEncoding encoding = new UnicodeEncoding();
            byte[] hashBytes = encoding.GetBytes(password);

            using (SHA256 sha256 = SHA256.Create())
            {
                byte[] cryptPassword = sha256.ComputeHash(hashBytes);
                return BitConverter.ToString(cryptPassword).Replace("-", "").ToLower(); // loại bỏ dấu "-" và chuyển về chữ thường
            }
        }
    }
}
