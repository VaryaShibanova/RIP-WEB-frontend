/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface HandlerAddToTreeRequest {
  /** @example 1 */
  anomaly_id: number;
}

export interface HandlerAddToTreeResponse {
  /** @example "Аномалия добавлена в заявку" */
  message?: string;
  /** @example 1 */
  tree_id?: number;
}

export interface HandlerAnomaliesListResponse {
  anomalies?: HandlerAnomalyShortResponse[];
}

export interface HandlerAnomalyCalculatedYear {
  /** @example "45,67,89" */
  anomalous_rings?: string;
  /** @example 1 */
  anomaly_id?: number;
  /** @example "Аномалия роста" */
  anomaly_name?: string;
  /** @example 2023 */
  calculated_year?: number;
}

export interface HandlerAnomalyDetailResponse {
  /** @example "Описание аномалии" */
  description?: string;
  /** @example 1 */
  id?: number;
  /** @example "http://localhost:9000/images/anomaly_1.jpg" */
  image_url?: string;
  /** @example "Аномалия роста" */
  name?: string;
  /** @example 2023 */
  year?: number;
}

export interface HandlerAnomalyShortResponse {
  /** @example 1 */
  id?: number;
  /** @example "http://localhost:9000/images/anomaly_1.jpg" */
  image_url?: string;
  /** @example "Аномалия роста" */
  name?: string;
  /** @example 2023 */
  year?: number;
}

export interface HandlerCompleteTreeRequest {
  /** @example "complete" */
  action: string;
}

export interface HandlerCompleteTreeResponse {
  anomalies?: HandlerAnomalyCalculatedYear[];
  /** @example 2023 */
  final_year?: number;
  /** @example 1 */
  id?: number;
  /** @example "завершён" */
  status?: string;
  /** @example 3 */
  total_anomalies?: number;
}

export interface HandlerCreateAnomalyRequest {
  /** @example "Описание аномалии" */
  description: string;
  /** @example "Аномалия роста" */
  name: string;
  /** @example 2023 */
  year: number;
}

export interface HandlerErrorResponse {
  /** @example "Описание ошибки" */
  error?: string;
}

export interface HandlerLoginRequest {
  /** @example "research_user" */
  login: string;
  /** @example "password123" */
  password: string;
}

export interface HandlerLoginResponse {
  /** @example "Успешная аутентификация" */
  message?: string;
  /** @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." */
  token?: string;
  user?: HandlerUserResponse;
}

export interface HandlerMessageResponse {
  /** @example "Сообщение об успехе" */
  message?: string;
}

export interface HandlerRegisterRequest {
  /**
   * @minLength 3
   * @maxLength 25
   * @example "new_user"
   */
  login: string;
  /**
   * @minLength 6
   * @example "securepassword"
   */
  password: string;
}

export interface HandlerTreeCartResponse {
  /** @example 0 */
  item_count?: number;
  /** @example 0 */
  tree_id?: number;
  /** @example -1 */
  user_id?: number;
}

export interface HandlerTreeDetailResponse {
  tree?: HandlerTreeResponse;
  treeItems?: HandlerTreeItemResponse[];
}

export interface HandlerTreeItemResponse {
  /** @example "45,67,89" */
  anomalous_rings?: string;
  /** @example 1 */
  anomaly_id?: number;
  /** @example "http://localhost:9000/images/anomaly_1.jpg" */
  anomaly_image?: string;
  /** @example "Аномалия роста" */
  anomaly_name?: string;
  /** @example 2023 */
  calculated_year?: number;
}

export interface HandlerTreeResponse {
  /** @example 1 */
  creator_id?: number;
  /** @example "Описание заявки" */
  description?: string;
  /** @example 2023 */
  final_year?: number;
  /** @example 1 */
  id?: number;
  /**
   * Добавляем для модератора
   * @example "черновик"
   */
  status?: string;
  /** @example 100 */
  total_rings?: number;
}

export interface HandlerTreeShortResponse {
  /** @example 3 */
  amount_of_anomalies?: number;
  /** @example "research_user" */
  creator?: string;
  /**
   * Добавляем final_year
   * @example 2023
   */
  final_year?: number;
  /** @example 1 */
  id?: number;
  /** @example "moderator_user" */
  moderator?: string;
  /** @example "черновик" */
  status?: string;
}

export interface HandlerTreesListResponse {
  trees?: HandlerTreeShortResponse[];
}

export interface HandlerUpdateAnomalyRequest {
  /** @example "Обновленное описание" */
  description?: string;
  /** @example "Обновленное название" */
  name?: string;
  /** @example 2024 */
  year?: number;
}

export interface HandlerUpdateAnomalyResponse {
  anomaly?: HandlerAnomalyDetailResponse;
  /** @example "Информация об аномалии обновлена" */
  message?: string;
}

export interface HandlerUpdateTreeItemRequest {
  /** @example "45,67,89" */
  anomalous_rings?: string;
}

export interface HandlerUpdateTreeItemResponse {
  /** @example "45,67,89" */
  anomalous_rings?: string;
  /** @example 0 */
  calculated_year?: number;
  /** @example "Элемент заявки обновлен" */
  message?: string;
}

export interface HandlerUpdateTreeRequest {
  /** @example "Обновленное описание" */
  description?: string;
  /**
   * Добавляем final_year
   * @example 2024
   */
  final_year?: number;
  /** @example 120 */
  total_rings?: number;
}

export interface HandlerUpdateUserRequest {
  /** @example "new_login" */
  login?: string;
}

export interface HandlerUploadImageResponse {
  /** @example "anomaly_image" */
  filename?: string;
  /** @example "http://localhost:9000/images/anomaly_1.jpg" */
  image_url?: string;
  /** @example "Изображение загружено" */
  message?: string;
}

export interface HandlerUserResponse {
  /** @example 1 */
  id?: number;
  /** @example false */
  is_moderator?: boolean;
  /** @example "research_user" */
  login?: string;
}

import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  HeadersDefaults,
  ResponseType,
} from "axios";
import axios from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams
  extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown>
  extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({
    securityWorker,
    secure,
    format,
    ...axiosConfig
  }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({
      ...axiosConfig,
      baseURL: axiosConfig.baseURL || "",
    });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(
    params1: AxiosRequestConfig,
    params2?: AxiosRequestConfig,
  ): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method &&
          this.instance.defaults.headers[
            method.toLowerCase() as keyof HeadersDefaults
          ]) ||
          {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input;
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] =
        property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(
          key,
          isFileType ? formItem : this.stringifyFormItem(formItem),
        );
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (
      type === ContentType.FormData &&
      body &&
      body !== null &&
      typeof body === "object"
    ) {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (
      type === ContentType.Text &&
      body &&
      body !== null &&
      typeof body !== "string"
    ) {
      body = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type ? { "Content-Type": type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

/**
 * @title RIP-WEB API
 * @version 1.0
 * @license MIT (https://opensource.org/licenses/MIT)
 * @contact API Support <support@rip-web.ru> (http://localhost:8080)
 *
 * API для системы исследования аномалий деревьев
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  api = {
    /**
     * @description Возвращает список аномалий с возможностью фильтрации по названию и году
     *
     * @tags anomalies
     * @name AnomaliesList
     * @summary Получение списка аномалий
     * @request GET:/api/anomalies
     */
    anomaliesList: (
      query?: {
        /** Фильтр по названию */
        name?: string;
        /** Фильтр по году */
        year?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<HandlerAnomaliesListResponse, any>({
        path: `/api/anomalies`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Создает новую запись об аномалии (требуется аутентификация)
     *
     * @tags anomalies
     * @name AnomaliesCreate
     * @summary Создание новой аномалии
     * @request POST:/api/anomalies
     * @secure
     */
    anomaliesCreate: (
      anomaly: HandlerCreateAnomalyRequest,
      params: RequestParams = {},
    ) =>
      this.request<HandlerAnomalyDetailResponse, HandlerErrorResponse>({
        path: `/api/anomalies`,
        method: "POST",
        body: anomaly,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Возвращает полную информацию об аномалии по ID
     *
     * @tags anomalies
     * @name AnomaliesDetail
     * @summary Получение информации об аномалии
     * @request GET:/api/anomalies/{id}
     */
    anomaliesDetail: (id: number, params: RequestParams = {}) =>
      this.request<HandlerAnomalyDetailResponse, HandlerErrorResponse>({
        path: `/api/anomalies/${id}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * @description Обновляет данные аномалии (требуется аутентификация)
     *
     * @tags anomalies
     * @name AnomaliesUpdate
     * @summary Обновление информации об аномалии
     * @request PUT:/api/anomalies/{id}
     * @secure
     */
    anomaliesUpdate: (
      id: number,
      anomaly: HandlerUpdateAnomalyRequest,
      params: RequestParams = {},
    ) =>
      this.request<HandlerUpdateAnomalyResponse, HandlerErrorResponse>({
        path: `/api/anomalies/${id}`,
        method: "PUT",
        body: anomaly,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Удаляет аномалию и связанное с ней изображение (требуется аутентификация)
     *
     * @tags anomalies
     * @name AnomaliesDelete
     * @summary Удаление аномалии
     * @request DELETE:/api/anomalies/{id}
     * @secure
     */
    anomaliesDelete: (id: number, params: RequestParams = {}) =>
      this.request<HandlerMessageResponse, HandlerErrorResponse>({
        path: `/api/anomalies/${id}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Загружает изображение для аномалии в Minio (требуется аутентификация)
     *
     * @tags anomalies
     * @name AnomaliesImageCreate
     * @summary Загрузка изображения для аномалии
     * @request POST:/api/anomalies/{id}/image
     * @secure
     */
    anomaliesImageCreate: (
      id: number,
      data: {
        /** Изображение */
        image: File;
        /** Название файла */
        filename?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<HandlerUploadImageResponse, HandlerErrorResponse>({
        path: `/api/anomalies/${id}/image`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.FormData,
        format: "json",
        ...params,
      }),

    /**
     * @description Возвращает список заявок с фильтрацией по статусу и дате
     *
     * @tags trees
     * @name TreesList
     * @summary Получение списка заявок
     * @request GET:/api/trees
     * @secure
     */
    treesList: (
      query?: {
        /** Фильтр по статусу */
        status?: string;
        /** Фильтр по дате от (формат: YYYY-MM-DD) */
        date_from?: string;
        /** Фильтр по дате до (формат: YYYY-MM-DD) */
        date_to?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<HandlerTreesListResponse, HandlerErrorResponse>({
        path: `/api/trees`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Возвращает данные корзины для авторизованных пользователей или статические данные для гостей
     *
     * @tags trees
     * @name TreesCartList
     * @summary Получение данных корзины
     * @request GET:/api/trees/cart
     */
    treesCartList: (params: RequestParams = {}) =>
      this.request<HandlerTreeCartResponse, any>({
        path: `/api/trees/cart`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * @description Добавляет аномалию в черновую заявку пользователя
     *
     * @tags tree-items
     * @name TreesCurrentItemsCreate
     * @summary Добавление аномалии в заявку
     * @request POST:/api/trees/current/items
     * @secure
     */
    treesCurrentItemsCreate: (
      item: HandlerAddToTreeRequest,
      params: RequestParams = {},
    ) =>
      this.request<HandlerAddToTreeResponse, HandlerErrorResponse>({
        path: `/api/trees/current/items`,
        method: "POST",
        body: item,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Возвращает полную информацию о заявке и ее элементах
     *
     * @tags trees
     * @name TreesDetail
     * @summary Получение информации о заявке
     * @request GET:/api/trees/{id}
     * @secure
     */
    treesDetail: (id: number, params: RequestParams = {}) =>
      this.request<HandlerTreeDetailResponse, HandlerErrorResponse>({
        path: `/api/trees/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Обновляет данные заявки (только для создателя и только черновые заявки)
     *
     * @tags trees
     * @name TreesUpdate
     * @summary Обновление заявки
     * @request PUT:/api/trees/{id}
     * @secure
     */
    treesUpdate: (
      id: number,
      tree: HandlerUpdateTreeRequest,
      params: RequestParams = {},
    ) =>
      this.request<HandlerTreeResponse, HandlerErrorResponse>({
        path: `/api/trees/${id}`,
        method: "PUT",
        body: tree,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Удаляет заявку (помечает статус как "удалён")
     *
     * @tags trees
     * @name TreesDelete
     * @summary Удаление заявки
     * @request DELETE:/api/trees/{id}
     * @secure
     */
    treesDelete: (id: number, params: RequestParams = {}) =>
      this.request<HandlerMessageResponse, HandlerErrorResponse>({
        path: `/api/trees/${id}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Завершает или отклоняет заявку (только для модераторов)
     *
     * @tags trees
     * @name TreesCompleteUpdate
     * @summary Завершение заявки модератором
     * @request PUT:/api/trees/{id}/complete
     * @secure
     */
    treesCompleteUpdate: (
      id: number,
      action: HandlerCompleteTreeRequest,
      params: RequestParams = {},
    ) =>
      this.request<HandlerCompleteTreeResponse, HandlerErrorResponse>({
        path: `/api/trees/${id}/complete`,
        method: "PUT",
        body: action,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Переводит заявку из статуса "черновик" в "сформирован"
     *
     * @tags trees
     * @name TreesFormUpdate
     * @summary Формирование заявки
     * @request PUT:/api/trees/{id}/form
     * @secure
     */
    treesFormUpdate: (id: number, params: RequestParams = {}) =>
      this.request<HandlerTreeResponse, HandlerErrorResponse>({
        path: `/api/trees/${id}/form`,
        method: "PUT",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Обновляет данные элемента заявки (аномальные кольца)
     *
     * @tags tree-items
     * @name TreesItemsUpdate
     * @summary Обновление элемента заявки
     * @request PUT:/api/trees/{id}/items/{anomaly_id}
     * @secure
     */
    treesItemsUpdate: (
      id: number,
      anomalyId: number,
      item: HandlerUpdateTreeItemRequest,
      params: RequestParams = {},
    ) =>
      this.request<HandlerUpdateTreeItemResponse, HandlerErrorResponse>({
        path: `/api/trees/${id}/items/${anomalyId}`,
        method: "PUT",
        body: item,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Удаляет аномалию из заявки
     *
     * @tags tree-items
     * @name TreesItemsDelete
     * @summary Удаление элемента из заявки
     * @request DELETE:/api/trees/{id}/items/{anomaly_id}
     * @secure
     */
    treesItemsDelete: (
      id: number,
      anomalyId: number,
      params: RequestParams = {},
    ) =>
      this.request<HandlerMessageResponse, HandlerErrorResponse>({
        path: `/api/trees/${id}/items/${anomalyId}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Вход в систему с получением JWT токена
     *
     * @tags auth
     * @name UsersLoginCreate
     * @summary Аутентификация пользователя
     * @request POST:/api/users/login
     */
    usersLoginCreate: (
      credentials: HandlerLoginRequest,
      params: RequestParams = {},
    ) =>
      this.request<HandlerLoginResponse, HandlerErrorResponse>({
        path: `/api/users/login`,
        method: "POST",
        body: credentials,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Завершение сессии пользователя с добавлением токена в blacklist
     *
     * @tags auth
     * @name UsersLogoutCreate
     * @summary Выход из системы
     * @request POST:/api/users/logout
     * @secure
     */
    usersLogoutCreate: (params: RequestParams = {}) =>
      this.request<HandlerMessageResponse, any>({
        path: `/api/users/logout`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Возвращает данные авторизованного пользователя
     *
     * @tags users
     * @name UsersMeList
     * @summary Получение информации о текущем пользователе
     * @request GET:/api/users/me
     * @secure
     */
    usersMeList: (params: RequestParams = {}) =>
      this.request<HandlerUserResponse, HandlerErrorResponse>({
        path: `/api/users/me`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Обновляет данные текущего пользователя
     *
     * @tags users
     * @name UsersProfileUpdate
     * @summary Обновление профиля пользователя
     * @request PUT:/api/users/profile
     * @secure
     */
    usersProfileUpdate: (
      user: HandlerUpdateUserRequest,
      params: RequestParams = {},
    ) =>
      this.request<HandlerUserResponse, HandlerErrorResponse>({
        path: `/api/users/profile`,
        method: "PUT",
        body: user,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Создание учетной записи пользователя
     *
     * @tags auth
     * @name UsersRegisterCreate
     * @summary Регистрация нового пользователя
     * @request POST:/api/users/register
     */
    usersRegisterCreate: (
      user: HandlerRegisterRequest,
      params: RequestParams = {},
    ) =>
      this.request<HandlerUserResponse, HandlerErrorResponse>({
        path: `/api/users/register`,
        method: "POST",
        body: user,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Проверяет подключение к Redis и работу blacklist
     *
     * @tags utils
     * @name UtilsTestRedisList
     * @summary Тестирование Redis
     * @request GET:/api/utils/test-redis
     * @secure
     */
    utilsTestRedisList: (params: RequestParams = {}) =>
      this.request<HandlerMessageResponse, any>({
        path: `/api/utils/test-redis`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),
  };
}
