import { useState, useEffect } from 'react'
import { api } from '../utils/api'

export default function CompanyAdminCertificates() {
  const [certificates, setCertificates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.certificates.list()
      .then(setCertificates)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-[#888888]">Loading certificates...</p>
  if (error) return <p className="text-red-600">{error}</p>

  return (
    <div>
      <h2 className="text-xl font-bold text-[#032147] mb-6">Certificates</h2>

      {certificates.length === 0 && (
        <p className="text-[#888888] text-sm">No certificates issued yet.</p>
      )}

      <div className="grid gap-3">
        {certificates.map(cert => (
          <div key={cert.id} className="bg-white rounded shadow-sm p-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-[#032147]">{cert.learner?.first_name} {cert.learner?.last_name}</p>
              <p className="text-xs text-[#888888]">{cert.course?.title} &middot; {new Date(cert.issued_at).toLocaleDateString()}</p>
            </div>
            <a
              href={cert.download_url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#01696f] text-white px-3 py-1.5 rounded text-sm hover:bg-[#015a5f]"
            >
              Download
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}
