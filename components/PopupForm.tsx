import Script from "next/script";

const PopupForm = () => {
  return (
    <>
      <iframe
        src="https://api.leadconnectorhq.com/widget/form/djLZrZMTFRPjUsorhPeK"
        style={{
          display: "none",
          width: "100%",
          height: "100%",
          border: "none",
          borderRadius: "3px",
        }}
        id="popup-djLZrZMTFRPjUsorhPeK"
        data-layout="{'id':'POPUP'}"
        data-trigger-type="alwaysShow"
        data-trigger-value=""
        data-activation-type="alwaysActivated"
        data-activation-value=""
        data-deactivation-type="neverDeactivate"
        data-deactivation-value=""
        data-form-name="Marketing Agency"
        data-height="626"
        data-layout-iframe-id="popup-djLZrZMTFRPjUsorhPeK"
        data-form-id="djLZrZMTFRPjUsorhPeK"
        title="Marketing Agency"
      />
      <Script
        src="https://link.msgsndr.com/js/form_embed.js"
        strategy="afterInteractive"
      />
    </>
  );
};

export default PopupForm;
