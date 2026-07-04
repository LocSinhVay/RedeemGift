import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import LuckyWheel from "./LuckyWheel";
import { allowPositiveNumbersOnly } from "../../hooks/allowPositiveNumbersOnly";
import { claimSpins, getDetailSpinInfoBySpinGrantId, spinWheel } from "@/controllers/CustomerSpinController";

// Định nghĩa lại kiểu cho Prize
interface PrizeItem {
  PrizeID: number;
  PrizeName: string;
}

const LuckyWheelPage: React.FC = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isInfoSubmitted, setIsInfoSubmitted] = useState(false);

  const [spinCount, setSpinCount] = useState(0);
  const [prizes, setPrizes] = useState<PrizeItem[]>([]);
  const [prize, setPrize] = useState<string | null>(null);
  const [backendPrizeId, setBackendPrizeId] = useState<number | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSpinning, setIsSpinning] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { spinGrantId } = useParams<{ spinGrantId: string }>();
  const navigate = useNavigate();

  // Load dữ liệu vòng quay
  useEffect(() => {
    if (!spinGrantId) {
      setError("Không tìm thấy mã quay thưởng!");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    getDetailSpinInfoBySpinGrantId(spinGrantId)
      .then((res) => {
        const data = res.Data as Array<{
          SpinGrantID: string;
          PrizeID: number;
          PrizeName: string;
          SpinsGranted: number;
        }>;

        if (data && data.length > 0) {
          setPrizes(data.map((d) => ({ PrizeID: d.PrizeID, PrizeName: d.PrizeName })));
          setSpinCount(data[0].SpinsGranted);
        } else {
          setError("Không tìm thấy thông tin quay thưởng hoặc đã hết hạn!");
        }
      })
      .catch((err) => {
        console.error(err);
        setError("Có lỗi xảy ra khi tải thông tin quay thưởng!");
      })
      .finally(() => setIsLoading(false));
  }, [spinGrantId]);

  // Gửi thông tin người chơi
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      Swal.fire({
        icon: "warning",
        title: "Thông tin thiếu",
        text: "Vui lòng nhập đầy đủ thông tin.",
      });
      return;
    }
    if (!spinGrantId) {
      Swal.fire({
        icon: "error",
        title: "Lỗi dữ liệu",
        text: "Không tìm thấy SpinGrantId.",
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("SpinGrantID", spinGrantId);
      formData.append("CustomerName", name);
      formData.append("CustomerPhone", phone);

      const res = await claimSpins(formData);
      if (res?.Data >= 0) {
        setIsInfoSubmitted(true);
      } else {
        Swal.fire({
          icon: "error",
          title: "Lưu thất bại",
          text: res?.Message || "Lưu thông tin thất bại. Vui lòng thử lại!",
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Có lỗi xảy ra khi lưu thông tin!",
      });
    }
  };

  // Xử lý khi nhấn quay
  const handleSpinClick = async () => {
    if (!spinGrantId || isSpinning || spinCount <= 0) return;

    setPrize(null);
    setMessage(null);
    setBackendPrizeId(null); // Reset PrizeID backend

    try {
      const res = await spinWheel(spinGrantId);
      if (res?.Data) {
        const { PrizeID, PrizeName, SpinsRemaining } = res.Data;
        setBackendPrizeId(PrizeID); // Lưu PrizeID từ backend
        setSpinCount(SpinsRemaining);
        setMessage("Đang quay... \nChúc bạn may mắn!");
      } else {
        setMessage(res?.Message || "Có lỗi khi quay. Vui lòng thử lại!");
      }
    } catch (err) {
      console.error(err);
      setMessage("Có lỗi xảy ra khi quay!");
      setIsSpinning(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Lỗi</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-lg rounded-xl overflow-hidden flex flex-col min-h-screen">
          {/* Header */}
          <div className="text-center font-bold text-lg py-4 bg-purple-100 text-purple-700">
            CHƯƠNG TRÌNH ĐỔI QUÀ
          </div>

          {/* Main */}
          <div className="flex-1 p-6 flex flex-col justify-between">
            {!isInfoSubmitted ? (
              <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Họ tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Nhập họ tên"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) =>
                        setPhone(allowPositiveNumbersOnly(e.target.value, "phone"))
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Nhập số điện thoại"
                    />
                  </div>

                  <div className="text-center py-4">
                    <div className="font-bold text-red-500 text-sm mb-3">
                      SỐ LƯỢT QUAY THƯỞNG
                    </div>
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white font-bold text-3xl shadow-lg">
                      {spinCount}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={spinCount === 0}
                    className="w-full py-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-bold text-lg rounded-lg transition-colors"
                  >
                    XÁC NHẬN
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col items-center flex-1 justify-center text-center">
                <p className="text-lg font-bold text-red-500 mb-6">
                  BẠN CÒN {spinCount} LƯỢT QUAY THƯỞNG
                </p>

                <LuckyWheel
                  prizes={prizes}
                  spinCount={spinCount}
                  resultPrizeId={backendPrizeId}
                  onSpinStart={() => setIsSpinning(true)}
                  onSpinEnd={(p) => {
                    setIsSpinning(false);
                    setPrize(p);
                    setBackendPrizeId(null);
                    setMessage(`Chúc mừng!\nBạn nhận được 01 ${p}`);
                  }}
                  onRequestSpin={handleSpinClick}
                />

                {message && (
                  <p
                    className={`font-bold text-xl mt-6 whitespace-pre-line ${isSpinning ? "text-yellow-500" : "text-green-500"
                      }`}
                  >
                    {message}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LuckyWheelPage;