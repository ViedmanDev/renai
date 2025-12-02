"use client"

import { useEffect } from "react"
import { useRouter, useParams } from "next/navigation"

export default function ProjectRedirect() {
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    router.push(`/project/${params.id}/canvas`)
  }, [params.id, router])

  return null
}
