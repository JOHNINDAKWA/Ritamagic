import React, { useState, useRef, useEffect } from "react";
import "./index.css"; // This line imports the CSS from index.css

// Import your assets. These paths assume they are in the src/assets folder.
// The map image is now a generic map image.
import mapImage from "./assets/map.png";
// The gps icon is now a generic gps icon.
import gpsIcon from "./assets/icon.png";

// Component for handling file uploads
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

// Component for displaying the image preview or placeholder
const ImageDisplay = ({ finalImageURL, isProcessing }) => (
  <div className="image-preview-container">
    {isProcessing ? (
      <div className="loading-text">Processing...</div>
    ) : finalImageURL ? (
      <img
        src={finalImageURL}
        alt="Image with GPS overlay"
        className="image-preview"
      />
    ) : (
      <div className="placeholder">
        <p>Upload an image to see the preview here.</p>
      </div>
    )}
  </div>
);

// Component for the download button
const DownloadButton = ({ onClick, disabled }) => (
  <div className="flex justify-center">
    <button onClick={onClick} disabled={disabled} className="download-button">
      Download Final Image
    </button>
  </div>
);

// The main application component
const App = () => {
  // State to hold the uploaded image's data URL
  const [uploadedImage, setUploadedImage] = useState(null);
  // State to hold the final generated image's data URL for display
  const [finalImageURL, setFinalImageURL] = useState(null);
  // State to show a loading indicator
  const [isProcessing, setIsProcessing] = useState(false);

  // Ref to access the canvas element
  const canvasRef = useRef(null);

  // Constants for the overlay text and base coordinates
  const locationText1 = "Nairobi, Nairobi County, Kenya";
  const locationText2 = "Lavington Location Westlands Division Westlands";
  const locationText3 = "Constituency, Nairobi, Nairobi County , Kenya";


  // Handle the file upload event
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target.result);
        setFinalImageURL(null); // Clear previous image
      };
      reader.readAsDataURL(file);
    }
  };

  // Effect to handle image processing whenever a new image is uploaded
  useEffect(() => {
    if (!uploadedImage) return;

    setIsProcessing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Create a new Image object for the uploaded image
    const userImg = new Image();
    userImg.src = uploadedImage;

    // Create new Image objects for the map and GPS icon
    const mapImg = new Image();
    mapImg.src = mapImage;

    const iconImg = new Image();
    iconImg.src = gpsIcon;

    // Function to draw a rectangle with rounded corners
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

    // Function to draw everything on the canvas
    const drawOverlay = () => {
      canvas.width = userImg.width;
      canvas.height = userImg.height;

      ctx.drawImage(userImg, 0, 0);

      const overlayBgColor = "#5d5d5b";

      // Margin from bottom and adjusted box height
      const marginBottom = userImg.height * 0.01;
      const boxHeight = userImg.height * 0.165;
      const boxY = userImg.height - boxHeight - marginBottom;

      const mapPadding = boxHeight * 0.05;
      const mapX = mapPadding;
      const mapY = boxY;
      const mapSize = boxHeight;

      const contentPadding = 15;
      const borderRadius = 10;

      // Draw map exactly same height as overlay
      ctx.drawImage(mapImg, mapX, mapY, mapSize, mapSize);

      const contentBoxWidth =
        userImg.width - (mapSize + mapPadding * 2 + contentPadding);
      const contentBoxX = mapSize + mapPadding + contentPadding;

      ctx.fillStyle = overlayBgColor;
      drawRoundedRect(
        ctx,
        contentBoxX,
        boxY,
        contentBoxWidth,
        boxHeight,
        borderRadius
      );

      const textX = contentBoxX + mapPadding;
      const textY = boxY + mapPadding * 1.5;

      const titleFontSize = contentBoxWidth * 0.045;
      const bodyFontSize = contentBoxWidth * 0.035;

      ctx.fillStyle = "white";

      // Title: big + thin
      ctx.font = `300 ${titleFontSize}px sans-serif`;
      ctx.fillText(locationText1, textX, textY + titleFontSize);

      // Body
      ctx.font = `${bodyFontSize}px sans-serif`;
      ctx.fillText(
        locationText2,
        textX,
        textY + titleFontSize + bodyFontSize + 5
      );
      ctx.fillText(
        locationText3,
        textX,
        textY + titleFontSize + bodyFontSize * 2 + 10
      );

      // Base constants you want to preserve
      const latPrefix = -1.2734;
      const longPrefix = 36.77;

      // Add small random noise to the last two decimal places
      const latDecimal = (Math.random() * 0.0099).toFixed(4); // 0.0000 - 0.0099
      const longDecimal = (Math.random() * 0.0099).toFixed(4);

      const latitude = (latPrefix + parseFloat(latDecimal)).toFixed(6);
      const longitude = (longPrefix + parseFloat(longDecimal)).toFixed(6);

      const latLongText = `Lat ${latitude}° Long ${longitude}°`;
      ctx.fillText(
        latLongText,
        textX,
        textY + titleFontSize + bodyFontSize * 3 + 15
      );

      const now = new Date();
      const pad = (n) => n.toString().padStart(2, "0");
      const day = pad(now.getDate());
      const month = pad(now.getMonth() + 1);
      const year = now.getFullYear();
      const hours = pad(now.getHours());
      const minutes = pad(now.getMinutes());

      const formattedTime = `${day}-${month}-${year} ${hours}:${minutes} +03:00`;

      ctx.fillText(
        formattedTime,
        textX,
        textY + titleFontSize + bodyFontSize * 4 + 25
      );

      // --- GPS Map Camera badge ---
      const gpsFontSize = boxHeight * 0.08;
      const gpsIconSize = gpsFontSize * 1.2;
      const gpsText = "GPS Map Camera";

      ctx.font = `bold ${gpsFontSize}px sans-serif`;
      const gpsTextWidth = ctx.measureText(gpsText).width;

      const badgePadding = 10;
      const badgeHeight = gpsIconSize + badgePadding;
      const badgeWidth = gpsIconSize + 10 + gpsTextWidth + 20;

      const badgeX = userImg.width - badgeWidth - mapPadding;
      const badgeY = boxY - badgeHeight + 10;

      ctx.fillStyle = overlayBgColor;
      drawRoundedRect(ctx, badgeX, badgeY, badgeWidth, badgeHeight, 12);

      ctx.drawImage(
        iconImg,
        badgeX + 10,
        badgeY + (badgeHeight - gpsIconSize) / 2,
        gpsIconSize,
        gpsIconSize
      );

      ctx.fillStyle = "white";
      ctx.fillText(
        gpsText,
        badgeX + gpsIconSize + 20,
        badgeY + gpsFontSize + (badgeHeight - gpsFontSize) / 2
      );

      setFinalImageURL(canvas.toDataURL("image/jpeg"));
      setIsProcessing(false);
    };

    // Ensure the original image, map, and icon are fully loaded before drawing
    Promise.all([
      new Promise((resolve) => (userImg.onload = resolve)),
      new Promise((resolve) => (mapImg.onload = resolve)),
      new Promise((resolve) => (iconImg.onload = resolve)),
    ]).then(drawOverlay);
  }, [uploadedImage]); // This effect runs whenever a new image is uploaded

  // Handle the download button click
  const handleDownload = () => {
    if (finalImageURL) {
      const link = document.createElement("a");
      link.href = finalImageURL;
      link.download = `edited_image_${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="app-container">
      <div className="main-card">
        <h1 className="app-title">Rita's Map Cam Magic</h1>

        <ImageUploader
          onImageUpload={handleImageUpload}
          uploadedImage={uploadedImage}
        />

        <ImageDisplay
          finalImageURL={finalImageURL}
          isProcessing={isProcessing}
        />

        <canvas ref={canvasRef} className="hidden-canvas"></canvas>

        <DownloadButton
          onClick={handleDownload}
          disabled={!finalImageURL || isProcessing}
        />
      </div>
    </div>
  );
};

export default App;
