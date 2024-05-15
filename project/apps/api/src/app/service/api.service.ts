import { Injectable } from '@nestjs/common';
import { ApplicationServiceURL } from '../app.config';
import { HttpService } from '@nestjs/axios';
import { Request } from 'express';
import { AxiosRequestConfig } from 'axios';

type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete' | 'postForm';
type ReqOptions<D> = {
  method: HttpMethod;
  endpoint: string;
  data?: D;
  options?: AxiosRequestConfig;
};

@Injectable()
export class ApiService {
  constructor(private readonly httpService: HttpService) {}

  private async request<D, R = unknown>(
    method: HttpMethod,
    url: string,
    data?: D,
    options?: AxiosRequestConfig
  ): Promise<R> {
    const response = await this.httpService.axiosRef[method]<R>(
      url,
      ...(method === 'get' || method === 'delete' ? [options] : [data, options])
    );
    return response.data;
  }

  private apiCall<D, R>(
    baseURL: string,
    { method, endpoint, data, options }: ReqOptions<D>
  ): Promise<R> {
    const url = `${baseURL}/${endpoint}`;
    return this.request<D, R>(method, url, data, options);
  }

  users<D, R>(options: ReqOptions<D>): Promise<R> {
    return this.apiCall<D, R>(ApplicationServiceURL.Users, options);
  }

  blog<D, R>(options: ReqOptions<D>): Promise<R> {
    return this.apiCall<D, R>(ApplicationServiceURL.Blog, options);
  }

  fileVault<D, R>(options: ReqOptions<D>): Promise<R> {
    return this.apiCall<D, R>(ApplicationServiceURL.FileVault, options);
  }

  getAuthorizationHeader(req: Request): AxiosRequestConfig {
    return {
      headers: {
        Authorization: req.headers['authorization'],
      },
    };
  }
}
