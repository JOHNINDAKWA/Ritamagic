import React, { useState, useRef, useEffect } from "react";
import "./index.css";
import mapImage from "./assets/map.png";
import gpsIcon from "./assets/icon.png";

const ImageUploader = ({ onImageUpload, uploadedImage }) => (
  <div className="flex flex-col items-center justify-center mb-6">
    <label htmlFor="file-upload" className="button-label">
      {uploadedImage ? "Change Image" : "Upload Image"}
    </label>
    <input
      id="file-upload"
      type="file"
      accept="image/*"
      onChange={onImageUpload}
      className="file-input"
    />
  </div>
);

const ImageDisplay = ({ finalImageURL, isProcessing }) => (
  <div className="image-preview-container">
    {isProcessing ? (
      <div className="loading-text">Processing...</div>
    ) : finalImageURL ? (
      <img src={finalImageURL} alt="Image with GPS overlay" className="image-preview" />
    ) : (
      <div className="placeholder">
        <p>Upload an image to see the preview here.</p>
      </div>
    )}
  </div>
);

const DownloadButton = ({ onClick, disabled }) => (
  <div className="flex justify-center">
    <button onClick={onClick} disabled={disabled} className="download-button">
      Download Final Image
    </button>
  </div>
);

const App = () => {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [finalImageURL, setFinalImageURL] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef(null);

  const locationText1 = "Nairobi, Nairobi County, Kenya";
  const locationText2 = "Lavington Location Westlands Division Westlands";
  const locationText3 = "Constituency, Nairobi, Nairobi County , Kenya";

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target.result);
        setFinalImageURL(null);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (!uploadedImage) return;

    setIsProcessing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const userImg = new Image();
    userImg.src = uploadedImage;

    const mapImg = new Image();
    mapImg.src = mapImage;

    const iconImg = new Image();
    iconImg.src = gpsIcon;

    const drawRoundedRect = (ctx, x, y, width, height, radius) => {
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.arcTo(x + width, y, x + width, y + radius, radius);
      ctx.lineTo(x + width, y + height - radius);
      ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
      ctx.lineTo(x + radius, y + height);
      ctx.arcTo(x, y + height, x, y + height - radius, radius);
      ctx.lineTo(x, y + radius);
      ctx.arcTo(x, y, x + radius, y, radius);
      ctx.closePath();
      ctx.fill();
    };

    const drawOverlay = () => {
      const targetWidth = 960;
      const targetHeight = 1280;
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const imgAspect = userImg.width / userImg.height;
      const canvasAspect = targetWidth / targetHeight;
      let srcX, srcY, srcW, srcH;

      if (imgAspect > canvasAspect) {
        srcH = userImg.height;
        srcW = canvasAspect * srcH;
        srcX = (userImg.width - srcW) / 2;
        srcY = 0;
      } else {
        srcW = userImg.width;
        srcH = srcW / canvasAspect;
        srcX = 0;
        srcY = (userImg.height - srcH) / 2;
      }

      ctx.drawImage(userImg, srcX, srcY, srcW, srcH, 0, 0, targetWidth, targetHeight);

      const overlayBgColor = "#5d5d5b";
      const marginBottom = targetHeight * 0.01;
      const boxHeight = targetHeight * 0.165;
      const boxY = targetHeight - boxHeight - marginBottom;

      const mapPadding = boxHeight * 0.05;
      const mapX = mapPadding;
      const mapY = boxY;
      const mapSize = boxHeight;

      const contentPadding = 15;
      const borderRadius = 10;

      ctx.drawImage(mapImg, mapX, mapY, mapSize, mapSize);

      const contentBoxWidth = targetWidth - (mapSize + mapPadding * 2 + contentPadding);
      const contentBoxX = mapSize + mapPadding + contentPadding;

      ctx.fillStyle = overlayBgColor;
      drawRoundedRect(ctx, contentBoxX, boxY, contentBoxWidth, boxHeight, borderRadius);

      const textX = contentBoxX + mapPadding;
      const textY = boxY + mapPadding * 1.5;

      const titleFontSize = contentBoxWidth * 0.045;
      const bodyFontSize = contentBoxWidth * 0.035;

      ctx.fillStyle = "white";
      ctx.font = `300 ${titleFontSize}px sans-serif`;
      ctx.fillText(locationText1, textX, textY + titleFontSize);

      ctx.font = `${bodyFontSize}px sans-serif`;
      ctx.fillText(locationText2, textX, textY + titleFontSize + bodyFontSize + 5);
      ctx.fillText(locationText3, textX, textY + titleFontSize + bodyFontSize * 2 + 10);

      const latitude = `-1.2799${Math.floor(Math.random() * 100).toString().padStart(2, '0')}`;
      const longitude = `36.7700${Math.floor(Math.random() * 100).toString().padStart(2, '0')}`;
      const latLongText = `Lat ${latitude}° Long ${longitude}°`;
      ctx.fillText(latLongText, textX, textY + titleFontSize + bodyFontSize * 3 + 15);

      const now = new Date();
      const pad = (n) => n.toString().padStart(2, "0");
      const formattedTime = `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())} +03:00`;
      ctx.fillText(formattedTime, textX, textY + titleFontSize + bodyFontSize * 4 + 25);

      const gpsFontSize = boxHeight * 0.08;
      const gpsIconSize = gpsFontSize * 1.2;
      const gpsText = "GPS Map Camera";

      ctx.font = `bold ${gpsFontSize}px sans-serif`;
      const gpsTextWidth = ctx.measureText(gpsText).width;

      const badgePadding = 10;
      const badgeHeight = gpsIconSize + badgePadding;
      const badgeWidth = gpsIconSize + 10 + gpsTextWidth + 20;
      const badgeX = targetWidth - badgeWidth - mapPadding;
      const badgeY = boxY - badgeHeight + 10;

      ctx.fillStyle = overlayBgColor;
      drawRoundedRect(ctx, badgeX, badgeY, badgeWidth, badgeHeight, 12);

      ctx.drawImage(iconImg, badgeX + 10, badgeY + (badgeHeight - gpsIconSize) / 2, gpsIconSize, gpsIconSize);

      ctx.fillStyle = "white";
      ctx.fillText(
        gpsText,
        badgeX + gpsIconSize + 20,
        badgeY + gpsFontSize + (badgeHeight - gpsFontSize) / 2
      );

      setFinalImageURL(canvas.toDataURL("image/jpeg"));
      setIsProcessing(false);
    };

    Promise.all([
      new Promise((res) => (userImg.onload = res)),
      new Promise((res) => (mapImg.onload = res)),
      new Promise((res) => (iconImg.onload = res)),
    ]).then(drawOverlay);
  }, [uploadedImage]);

  const handleDownload = () => {
    if (finalImageURL) {
      const link = document.createElement("a");
      link.href = finalImageURL;
      link.download = `image_${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="app-container">
      <div className="main-card">
        <h1 className="app-title">Rita's Map Cam Magic</h1>
        <ImageUploader onImageUpload={handleImageUpload} uploadedImage={uploadedImage} />
        <ImageDisplay finalImageURL={finalImageURL} isProcessing={isProcessing} />
        <canvas ref={canvasRef} className="hidden-canvas"></canvas>
        <DownloadButton onClick={handleDownload} disabled={!finalImageURL || isProcessing} />
      </div>
    </div>
  );
};

export default App;