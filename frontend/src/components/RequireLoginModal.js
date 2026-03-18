import { Modal } from "antd";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Context from "services/context";
import { PrimarySmallButton, SecondarySmallButton } from "./misc/Buttons";

function RequireLoginModal(props) {
  const navigate = useNavigate();
  const context = useContext(Context);
  const [errModal, setErrModal] = useState(false);

  useEffect(() => {
    if (context?.cassava && !context?.user) setErrModal(true);
    // eslint-disable-next-line
  }, [context?.cassava, context?.user]);

  return (
    <Modal
      footer={false}
      title="Chưa đăng nhập"
      open={errModal}
      maskClosable={false}
      closable={false}
      centered={true}
    >
      <div className="flex justify-center font-semibold text-xl">
        Vui lòng Đăng nhập để truy cập {props?.pageName || "trang này"}!
      </div>
      <div className="pt-4 flex justify-around">
        <SecondarySmallButton onClick={() => navigate("/")}>
          Quay về trang chủ
        </SecondarySmallButton>
        <PrimarySmallButton onClick={() => navigate("/signin")}>
          Đến trang Đăng nhập
        </PrimarySmallButton>
      </div>
    </Modal>
  );
}

export default RequireLoginModal;
