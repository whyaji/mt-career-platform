# PDDIKTI API Documentation

This document describes the PDDIKTI API endpoints available in the MT Career Platform for checking student data from the Indonesian Higher Education Database (PDDIKTI).

## Overview

The PDDIKTI API service allows you to search and retrieve information about:

-   Students (Mahasiswa)
-   Lecturers (Dosen)
-   Universities (Perguruan Tinggi)
-   Study Programs (Program Studi)

## Authentication

All PDDIKTI API endpoints require JWT authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer {your_jwt_token}
```

## Base URL

```
/api/v1/talenthub/pddikti/
```

## Search Endpoints

### Search All Categories

Search across all categories (students, lecturers, universities, study programs).

**POST** `/search/all`

**Request Body:**

```json
{
    "keyword": "search term"
}
```

**Response:**

```json
{
    "success": true,
    "data": {
        // Search results across all categories
    },
    "message": "Search completed successfully"
}
```

### Search Students

Search for students by name or other criteria.

**POST** `/search/mahasiswa`

**Request Body:**

```json
{
    "keyword": "student name"
}
```

### Search Lecturers

Search for lecturers by name or other criteria.

**POST** `/search/dosen`

**Request Body:**

```json
{
    "keyword": "lecturer name"
}
```

### Search Universities

Search for universities by name or other criteria.

**POST** `/search/pt`

**Request Body:**

```json
{
    "keyword": "university name"
}
```

### Search Study Programs

Search for study programs by name or other criteria.

**POST** `/search/prodi`

**Request Body:**

```json
{
    "keyword": "program name"
}
```

## Student Detail Endpoints

### Get Student Details

Get detailed information about a specific student.

**GET** `/mahasiswa/{mahasiswaId}`

**Parameters:**

-   `mahasiswaId` (string): Student ID obtained from search results

## Lecturer Detail Endpoints

### Get Lecturer Profile

Get comprehensive profile information of a lecturer.

**GET** `/dosen/{dosenId}/profile`

### Get Lecturer Research Activities

Get research activities of a lecturer.

**GET** `/dosen/{dosenId}/penelitian`

### Get Lecturer Community Service

Get community service activities of a lecturer.

**GET** `/dosen/{dosenId}/pengabdian`

### Get Lecturer Academic Works

Get academic works of a lecturer.

**GET** `/dosen/{dosenId}/karya`

### Get Lecturer Patents

Get patents of a lecturer.

**GET** `/dosen/{dosenId}/paten`

### Get Lecturer Study History

Get study history of a lecturer.

**GET** `/dosen/{dosenId}/study-history`

### Get Lecturer Teaching History

Get teaching history of a lecturer.

**GET** `/dosen/{dosenId}/teaching-history`

## University Detail Endpoints

### Get University Details

Get detailed information about a university.

**GET** `/pt/{ptId}`

### Get University Study Programs

Get study programs offered by a university for a specific semester.

**GET** `/pt/{ptId}/prodi`

**Query Parameters:**

-   `tahun` (string): Academic semester in YYYYS format (e.g., "20241" for first semester 2024)

### Get University Logo

Get university logo as base64 encoded string.

**GET** `/pt/{ptId}/logo`

### Get University Ratio Information

Get ratio information for a university.

**GET** `/pt/{ptId}/rasio`

### Get University Student Statistics

Get student statistics for a university.

**GET** `/pt/{ptId}/mahasiswa`

## Study Program Detail Endpoints

### Get Study Program Details

Get detailed information about a study program.

**GET** `/prodi/{prodiId}`

### Get Study Program Description

Get description and statistics of a study program.

**GET** `/prodi/{prodiId}/desc`

### Get Study Program Student and Lecturer Counts

Get student and lecturer counts for a study program.

**GET** `/prodi/{prodiId}/counts`

### Get Study Program Cost Range

Get cost range for a study program.

**GET** `/prodi/{prodiId}/cost-range`

### Get Study Program Capacity

Get capacity information for a study program.

**GET** `/prodi/{prodiId}/capacity`

### Get Study Program Lecturer-Student Ratio

Get lecturer-student ratio for a study program.

**GET** `/prodi/{prodiId}/ratio`

### Get Study Program Graduation Rate

Get graduation rate for a study program.

**GET** `/prodi/{prodiId}/graduation-rate`

## Count Endpoints

### Get Active Lecturer Count

Get count of active lecturers in the system.

**GET** `/counts/dosen-active`

### Get Active Student Count

Get count of active students in the system.

**GET** `/counts/mahasiswa-active`

### Get Study Program Count

Get count of study programs in the system.

**GET** `/counts/prodi`

### Get University Count

Get count of universities in the system.

**GET** `/counts/pt`

## Visualization Endpoints

These endpoints provide data for visualization and analytics:

### Lecturer Visualizations

-   `GET /visualisasi/dosen-keaktifan` - Lecturer activity data
-   `GET /visualisasi/dosen-bidang` - Lecturer field distribution
-   `GET /visualisasi/dosen-jenis-kelamin` - Lecturer gender distribution
-   `GET /visualisasi/dosen-jenjang` - Lecturer education level data
-   `GET /visualisasi/dosen-ikatan` - Lecturer employment binding data

### Student Visualizations

-   `GET /visualisasi/mahasiswa-bidang` - Student field distribution
-   `GET /visualisasi/mahasiswa-jenis-kelamin` - Student gender distribution
-   `GET /visualisasi/mahasiswa-jenjang` - Student education level data
-   `GET /visualisasi/mahasiswa-kelompok-lembaga` - Student institutional group data
-   `GET /visualisasi/mahasiswa-status` - Student status data

### University Visualizations

-   `GET /visualisasi/pt-bentuk` - University type data
-   `GET /visualisasi/pt-akreditasi` - University accreditation data
-   `GET /visualisasi/pt-kelompok-pembina` - University administrative overseer data
-   `GET /visualisasi/pt-provinsi` - University province distribution

### Study Program Visualizations

-   `GET /visualisasi/prodi-jenjang` - Study program level data
-   `GET /visualisasi/prodi-akreditasi` - Study program accreditation data
-   `GET /visualisasi/prodi-bidang-ilmu` - Study program field of science data
-   `GET /visualisasi/prodi-kelompok-pembina` - Study program administrative overseer data

## Additional Endpoints

### Get Contributor Information

Get information about PDDIKTI contributors.

**GET** `/contributor`

### Get News Articles

Get news articles from PDDIKTI.

**GET** `/news`

### Get Field of Sciences

Get field of sciences data.

**GET** `/bidang-ilmu`

### Check Student Graduation Status

Check student graduation status based on search criteria.

**POST** `/check-status-kelulusan`

**Request Body:**

```json
{
    "nama": "John Doe",
    "nim": "1234567890",
    "program_studi": "Teknik Informatika",
    "universitas": "Universitas ABC"
}
```

**Parameters:**

-   `nama` (optional): Student name
-   `nim` (optional): Student ID number
-   `program_studi` (optional): Study program name
-   `universitas` (optional): University name

**Note:** At least one parameter must be provided.

**Response (Success):**

```json
{
    "success": true,
    "message": "Ditemukan 1 mahasiswa",
    "total_found": 1,
    "search_criteria": {
        "nama": "John Doe",
        "nim": "1234567890",
        "program_studi": "Teknik Informatika",
        "universitas": "Universitas ABC"
    },
    "search_info": {
        "fallback_used": false,
        "note": null
    },
    "results": [
        {
            "nama": "John Doe",
            "nim": "1234567890",
            "program_studi": "Teknik Informatika",
            "universitas": "Universitas ABC",
            "jenis_kelamin": "L",
            "tempat_lahir": "Jakarta",
            "tanggal_lahir": "1995-01-01",
            "nama_ibu": "Jane Doe",
            "jenjang": "S1",
            "tahun_masuk": "2013",
            "status_saat_ini": "LULUS",
            "ijazah_verification": {
                "status": "GRADUATED",
                "valid": true,
                "message": "Mahasiswa telah lulus",
                "icon": "✅"
            }
        }
    ]
}
```

**Response (No Results):**

```json
{
    "success": false,
    "message": "Data mahasiswa tidak ditemukan",
    "suggestions": [
        "Nama, NIM, program studi, atau universitas tidak terdaftar di PDDIKTI",
        "Data belum terupdate di sistem",
        "Kesalahan penulisan kriteria pencarian",
        "Coba dengan kriteria pencarian yang berbeda"
    ]
}
```

**Graduation Status Values:**

-   `GRADUATED` (✅): Student has graduated
-   `ACTIVE` (🟡): Student is still active (not graduated)
-   `DROPOUT` (❌): Student is inactive/dropped out
-   `UNKNOWN` (❓): Status is unknown

## Error Responses

All endpoints return consistent error responses:

```json
{
    "success": false,
    "error": "ERROR_CODE",
    "message": "Human readable error message"
}
```

Common error codes:

-   `VALIDATION_ERROR` - Invalid input parameters
-   `SEARCH_FAILED` - Search operation failed
-   `DETAILS_FAILED` - Failed to retrieve details
-   `PROFILE_FAILED` - Failed to retrieve profile
-   `RESEARCH_FAILED` - Failed to retrieve research data
-   `UNIVERSITY_DETAILS_FAILED` - Failed to retrieve university details
-   `STUDY_PROGRAM_DETAILS_FAILED` - Failed to retrieve study program details
-   `LOGO_NOT_FOUND` - Logo not found
-   `GRADUATION_STATUS_CHECK_FAILED` - Failed to check graduation status
-   `RATE_LIMIT_EXCEEDED` - Rate limit exceeded

## Rate Limiting

The PDDIKTI API implements rate limiting to prevent abuse. If you exceed the rate limit, you will receive a 429 status code with the error message "Rate limit exceeded".

## Usage Examples

### Search for a Student

```bash
curl -X POST "https://your-domain.com/api/v1/talenthub/pddikti/search/mahasiswa" \
  -H "Authorization: Bearer your_jwt_token" \
  -H "Content-Type: application/json" \
  -d '{"keyword": "Ahmad"}'
```

### Get Student Details

```bash
curl -X GET "https://your-domain.com/api/v1/talenthub/pddikti/mahasiswa/student_id_here" \
  -H "Authorization: Bearer your_jwt_token"
```

### Get University Study Programs

```bash
curl -X GET "https://your-domain.com/api/v1/talenthub/pddikti/pt/university_id_here/prodi?tahun=20241" \
  -H "Authorization: Bearer your_jwt_token"
```

### Check Student Graduation Status

```bash
curl -X POST "https://your-domain.com/api/v1/talenthub/pddikti/check-status-kelulusan" \
  -H "Authorization: Bearer your_jwt_token" \
  -H "Content-Type: application/json" \
  -d '{
    "nama": "John Doe",
    "nim": "1234567890",
    "program_studi": "Teknik Informatika",
    "universitas": "Universitas ABC"
  }'
```

## Notes

1. All IDs used in the API are base64-encoded strings obtained from search results.
2. Semester format (tahun parameter) should be in YYYYS format where YYYY is the year and S is the semester number (1 or 2).
3. The API automatically handles IP detection and includes it in requests to the PDDIKTI service.
4. All responses are in JSON format.
5. The service includes comprehensive error handling and logging for debugging purposes.
