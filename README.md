# 알렉산더 포토

구글 포토 클론 프로젝트입니다.

![screenshot](https://user-images.githubusercontent.com/49304239/149685950-d93b57e6-9270-4b6f-9287-ff69f9ad0a2b.gif)

알렉산더는 저희 집 고양이 이름이에요. 코리안 숏헤어이고, 2018년 11월에 태어나(추정), 2019년 11월에 가족이 되었답니다.

데모 링크에서 이미지 업로드와 삭제를 자유롭게 해볼 수 있습니다. (업로드 가능한 이미지: 5MB 이하의 `jpg` 또는 `png` 파일)

[데모 링크](https://alexander-photos.vercel.app/) (데모 링크는 모바일에서도 접속할 수 있습니다.)

## 프론트엔드 기술 스택

- JavaScript
- Jasmine

## 백엔드 기술 스택

- Node.js
- Express
- MongoDB
- Serverless Framework
- AWS
  - S3
  - Lambda
  - API Gateway

## API

API 엔드포인트: [https://4gpk31lzj8.execute-api.ap-northeast-2.amazonaws.com/dev](https://4gpk31lzj8.execute-api.ap-northeast-2.amazonaws.com/dev)

### GET /api/images

모든 이미지 정보를 가져옵니다.

**Response Example**

200: OK

```json
{
  "results": [
    {
      "_id": "61e4befae9d0a1b730b8a0a2",
      "filePath": "1638610207000/IMG_0279.jpg",
      "dateTime": 1638610207000,
      "make": "Apple",
      "model": "iPhone 12",
      "orientation": 6,
      "pixelXDimension": 4032,
      "pixelYDimension": 3024
    }
  ]
}
```

---

### GET /api/image/:id

이미지 정보를 가져옵니다.

**Path Parameters**

| Name | Type   | Description |
| ---- | ------ | ----------- |
| id   | string | 파일 ID     |

**Response Example**

200: OK

```json
{
  "result": {
    "_id": "61e4befae9d0a1b730b8a0a2",
    "filePath": "1638610207000/IMG_0279.jpg",
    "dateTime": 1638610207000,
    "make": "Apple",
    "model": "iPhone 12",
    "orientation": 6,
    "pixelXDimension": 4032,
    "pixelYDimension": 3024
  }
}
```

### POST /api/image

이미지를 업로드합니다.

**Form Data Parameters**

| Name                | Type   | Description                        |
| ------------------- | ------ | ---------------------------------- |
| photo               | file   | 6MB 이하의 jpg, png, gif 파일      |
| exifData (optional) | string | EXIF (JSON을 string으로 변환한 값) |

**Response Example**

201: Created

```json
{
  "message": "Uploaded IMG_0441.jpg successfully",
  "result": {
    "filePath": "1645192866662/IMG_0441.jpg",
    "dateTime": 1645192866662,
    "orientation": 1,
    "pixelXDimension": 4032,
    "pixelYDimension": 3024,
    "_id": "620fa6a3a1f95d95538439f3"
  }
}
```

---

### DELETE /api/image/:filePath

이미지를 삭제합니다.

**Path Parameters**

| Name     | Type   | Description |
| -------- | ------ | ----------- |
| filePath | string | 파일 경로   |

**Response Example**

200: OK

```json
{
  "message": "Deleted 1645192909423/IMG_0441.jpg successfully"
}
```

---

### GET /image/:filePath

최적화된 이미지를 가져옵니다.

w, h를 쿼리 파라미터로 넘기면, 그에 맞는 너비와 높이를 가진 이미지를 가져올 수 있습니다.

(gif 파일은 w, h 쿼리 파라미터로 크기를 지정할 수 없으며, 원본 이미지를 가져옵니다.)

w 또는 h가 원본 이미지의 너비 또는 높이보다 크다면, 결과 이미지의 크기는 자동으로 원본 이미지의 너비 또는 높이가 됩니다.

**Path Parameters**

| Name     | Type   | Description |
| -------- | ------ | ----------- |
| filePath | string | 파일 경로   |

**Query Parameters**

| Name         | Type   | Description |
| ------------ | ------ | ----------- |
| w (optional) | number | 너비        |
| h (optional) | number | 높이        |

---

### GET /image/original/:filePath

이미지 원본을 가져옵니다.

**Path Parameters**

| Name     | Type   | Description |
| -------- | ------ | ----------- |
| filePath | string | 파일 경로   |
