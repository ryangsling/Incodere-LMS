import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { Card, CardBody, Skeleton, Badge, Button } from '../components/ui'
import { CheckBadgeIcon, ExclamationTriangleIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline'

export default function VerifyCertificate() {
  const { certificateId } = useParams()
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    api.verify.certificate(certificateId)
      .then((d) => { if (!cancelled) setData(d) })
      .catch((e) => { if (!cancelled) setError(e.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [certificateId])

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <Link to="/" className="block text-center mb-6">
          <span className="font-bold text-lg text-navy-700">ILMS</span>
        </Link>

        {loading && (
          <Card>
            <CardBody>
              <Skeleton variant="block" className="h-6 w-1/2 mb-3" />
              <Skeleton variant="text" />
              <Skeleton variant="text" />
            </CardBody>
          </Card>
        )}

        {error && (
          <Card>
            <CardBody className="text-center">
              <ExclamationTriangleIcon className="mx-auto size-12 text-red-500 mb-3" />
              <h1 className="text-lg font-bold text-navy-700 mb-2">Certificate Not Found</h1>
              <p className="text-sm text-muted">{error}</p>
            </CardBody>
          </Card>
        )}

        {data?.valid && (
          <Card>
            <CardBody className="text-center">
              <CheckBadgeIcon className="mx-auto size-16 text-accent-600 mb-4" />
              <Badge variant="success" className="mb-3">Verified</Badge>
              <h1 className="text-lg font-bold text-navy-700 mb-1">{data.learner_name}</h1>
              <p className="text-sm text-muted mb-4">has successfully completed</p>
              <p className="text-base font-semibold text-primary-700 mb-4">{data.course_title}</p>
              <p className="text-xs text-muted">Issued on {new Date(data.issued_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="text-xs text-muted mt-1">Certificate ID: {data.certificate_id}</p>
              {user && (
                <button
                  type="button"
                  onClick={() => api.certificates.download(data.certificate_id).catch(() => {})}
                  className="inline-flex items-center gap-2 mt-5 text-sm font-semibold text-primary-600 hover:text-primary-700"
                >
                  <ArrowDownTrayIcon className="size-4" />
                  Download PDF
                </button>
              )}
            </CardBody>
          </Card>
        )}

        <p className="text-center text-xs text-muted mt-6">
          <Link to="/" className="hover:text-primary-600">Return to ILMS</Link>
        </p>
      </div>
    </div>
  )
}
