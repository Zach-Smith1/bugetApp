import React from 'react';

const InnerModal = ({ isOpen, closeModal, children }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button onClick={closeModal} className="modal-close-button">
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

export default InnerModal;
