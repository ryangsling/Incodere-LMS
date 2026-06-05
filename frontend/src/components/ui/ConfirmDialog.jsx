import Modal from './Modal'
import Button from './Button'
import Alert from './Alert'

// Adapted from twp-components/Application UI/Overlays/Modal Dialogs/Centered with wide buttons/v4
export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      {description && (
        <Alert variant={variant === 'danger' ? 'danger' : 'info'}>
          {description}
        </Alert>
      )}
    </Modal>
  )
}
