import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import { setupAxios } from '@/contexts/AuthHelpers'

class ApiService {
  private client: AxiosInstance
  private resource: string
  private method: string
  private isQueryParams: boolean

  constructor(
    resource: string,
    method: string = 'get',
    isQueryParams: boolean = false,
    headers: { key: string; value: string }[] = []
  ) {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL,
      headers: Object.fromEntries(headers.map(({ key, value }) => [key, value])),
    })

    setupAxios(this.client) // Tự động thêm Authorization

    this.resource = resource
    this.method = method.toLowerCase()
    this.isQueryParams = isQueryParams
  }

  async request<T = any>(data: Record<string, any> = {}, params: Record<string, any> = {}): Promise<T> {
    try {
      const config: AxiosRequestConfig = {
        method: this.method as AxiosRequestConfig['method'],
        url: this.resource,
        params: this.isQueryParams ? params : {},
        data: this.isQueryParams ? {} : data,
      }

      const response = await this.client(config)
      return response.data
    } catch (error) {
      return this.handleError(error)
    }
  }

  async requestFile(file: File): Promise<any> {
    try {
      // Tạo FormData và thêm file
      const formData = new FormData();
      formData.append('file', file)

      const response = await this.client.post(this.resource, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return response.data
    } catch (error) {
      return this.handleError(error)
    }
  }

  async requestMultipart(formData: FormData): Promise<any> {
    try {
      const response = await this.client.post(this.resource, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return response.data
    } catch (error) {
      return this.handleError(error)
    }
  }

  async requestPdf(data: Record<string, any> = {}, params: Record<string, any> = {}): Promise<Blob> {
    try {
      const response = await this.client.post(this.resource, data, {
        params,
        responseType: 'blob',
      })

      return response.data
    } catch (error) {
      return this.handleError(error)
    }
  }

  private handleError(error: any): never {
    console.error('API Error:', error)

    if (error.response) {
      throw new Error(error.response.data?.Message || 'Lỗi từ server')
    } else if (error.request) {
      throw new Error('Không có phản hồi từ server')
    } else {
      throw new Error(error.message || 'Lỗi không xác định')
    }
  }
}

export default ApiService
