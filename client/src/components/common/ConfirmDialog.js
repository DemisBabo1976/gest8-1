import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const ConfirmDialog = ({ 
  show, 
  title, 
  message, 
  confirmText = 'Conferma', 
  cancelText = 'Annulla', 
  confirmVariant = 'primary',
  onConfirm, 
  onCancel 
}) => {
  return (
    <Modal show={show} onHide={onCancel} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>{message}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onCancel}>
          {cancelText}
        </Button>
        <Button variant={confirmVariant} onClick={onConfirm}>
          {confirmText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmDialog;