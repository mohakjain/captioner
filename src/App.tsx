import React, { useState } from 'react';
import { ImageUpload } from './components/ImageUpload';
import { ImagePreview } from './components/ImagePreview';
import { ImageCrop } from './components/ImageCrop';
import { CropControls } from './components/CropControls';
import { SaveImageButton } from './components/SaveImageButton';
import { CaptionPreview } from './components/CaptionPreview';
import { useImageState } from './hooks/useImageState';
import { AspectRatio, ASPECT_RATIOS } from './types/image';
import './App.css';

const App: React.FC = () => {
  const { 
    currentImage, 
    isProcessing, 
    isCropping, 
    isCaptioning,
    error, 
    setImage, 
    clearImage, 
    clearError, 
    startCropping,
    cancelCropping,
    cropImage,
    removeCroppedImage,
    startCaptioning,
    cancelCaptioning,
    saveCaptionToImage,
    removeCaptionsFromImage
  } = useImageState();

  const [selectedAspectRatio, setSelectedAspectRatio] = useState<AspectRatio>(ASPECT_RATIOS[0]); // Default to 'Free'

  const handleImageSelect = async (file: File) => {
    clearError();
    await setImage(file);
  };

  // If we're in cropping mode, show the crop interface
  if (isCropping && currentImage) {
    return (
      <ImageCrop
        imageSrc={currentImage.url}
        onCropComplete={cropImage}
        onCancel={cancelCropping}
        aspectRatio={selectedAspectRatio.value}
        className="app__crop"
      />
    );
  }

  // If we're in captioning mode, show the caption interface
  if (isCaptioning && currentImage) {
    return (
      <CaptionPreview
        image={currentImage}
        onBack={cancelCaptioning}
        onSaveCaption={saveCaptionToImage}
        className="app__caption"
      />
    );
  }

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">📽️ Captioner</h1>
        <p className="app__subtitle">Add vintage movie-style captions to your images</p>
      </header>

      <main className="app__main">
        {!currentImage ? (
          <ImageUpload
            onImageSelect={handleImageSelect}
            isProcessing={isProcessing}
            error={error}
            className="app__upload"
          />
        ) : (
          <div className="app__preview-section">
            <ImagePreview
              image={currentImage}
              onRemove={clearImage}
              className="app__preview"
              showCroppedImage={true}
            />
            
            {/* Show different UI based on image state */}
            {!currentImage.croppedImage && !currentImage.captions ? (
              // Original image - show crop controls and save original option
              <>
                <CropControls
                  selectedAspectRatio={selectedAspectRatio}
                  onAspectRatioChange={setSelectedAspectRatio}
                  onStartCrop={startCropping}
                  className="app__crop-controls"
                />
                
                <div className="app__save-section">
                  <SaveImageButton
                    image={currentImage}
                    preferCropped={false}
                    variant="secondary"
                    size="medium"
                    className="app__save-original"
                  />
                </div>
              </>
            ) : (
              // Image has been processed (cropped and/or captioned)
              <div className="app__processed-actions">
                <div className="app__primary-actions">
                  <SaveImageButton
                    image={currentImage}
                    preferCropped={currentImage.croppedImage ? true : false}
                    variant="primary"
                    size="medium"
                    className="app__save-processed"
                  />
                  <button 
                    className="app__button app__button--primary"
                    onClick={startCaptioning}
                  >
                    {currentImage.captions ? '✏️ Edit Captions' : '📝 Add Captions'}
                  </button>
                </div>
                
                <div className="app__secondary-actions">
                  {currentImage.croppedImage && (
                    <button 
                      onClick={removeCroppedImage}
                      className="app__button app__button--secondary"
                    >
                      Recrop Image
                    </button>
                  )}
                  {currentImage.captions && (
                    <button 
                      onClick={removeCaptionsFromImage}
                      className="app__button app__button--secondary"
                    >
                      Remove Captions
                    </button>
                  )}
                </div>
              </div>
            )}
            
            <div className="app__actions">
              <button 
                onClick={clearImage}
                className="app__button app__button--tertiary"
              >
                Upload Different Image
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="app__footer">
        <p>Ready to add some vintage movie magic to your photos!</p>
      </footer>
    </div>
  );
};

export default App;
