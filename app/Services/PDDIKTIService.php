<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PDDIKTIService
{
    private $baseUrl;
    private $headers;
    private $timeout;
    private $host;
    private $origin;
    private $referer;

    public function __construct()
    {
        // Base64 encoded URLs from Python helper
        $this->baseUrl = base64_decode('aHR0cHM6Ly9hcGktcGRkaWt0aS5rZW1kaWt0aXNhaW50ZWsuZ28uaWQ=');
        $this->host = base64_decode('YXBpLXBkZGlrdGkua2VtZGlrdGlzYWludGVrLmdvLmlk');
        $this->origin = base64_decode('aHR0cHM6Ly9wZGRpa3RpLmtlbWRpa3Rpc2FpbnRlay5nby5pZA==');
        $this->referer = base64_decode('aHR0cHM6Ly9wZGRpa3RpLmtlbWRpa3Rpc2FpbnRlay5nby5pZC8=');
        $this->timeout = 30;

        $this->headers = [
            'Accept' => 'application/json, text/plain, */*',
            'Accept-Encoding' => 'gzip, deflate, br, zstd',
            'Accept-Language' => 'en-US,en;q=0.9,mt;q=0.8',
            'Connection' => 'keep-alive',
            'DNT' => '1',
            'Host' => $this->host,
            'Origin' => $this->origin,
            'Referer' => $this->referer,
            'Sec-Fetch-Dest' => 'empty',
            'Sec-Fetch-Mode' => 'cors',
            'Sec-Fetch-Site' => 'same-site',
            'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0',
            'sec-ch-ua' => '"Microsoft Edge";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
            'sec-ch-ua-mobile' => '?0',
            'sec-ch-ua-platform' => '"Windows"'
        ];
    }

    /**
     * Get current IP address
     */
    private function getCurrentIp(): string
    {
        try {
            $response = Http::timeout(10)->get('https://api.ipify.org?format=json');
            if ($response->successful()) {
                $data = $response->json();
                return $data['ip'] ?? $this->getFallbackIp();
            }
        } catch (Exception $e) {
            Log::warning("Failed to get current IP: {$e->getMessage()}");
        }

        return $this->getFallbackIp();
    }

    /**
     * Get fallback IP address
     */
    private function getFallbackIp(): string
    {
        return base64_decode('MTAzLjQ3LjEzMi4yOQ=='); // 103.47.132.29
    }

    /**
     * Get headers with current IP
     */
    private function getHeaders(): array
    {
        $headers = $this->headers;
        $headers['X-User-IP'] = $this->getCurrentIp();
        return $headers;
    }

    /**
     * Make HTTP request to PDDIKTI API
     */
    private function makeRequest(string $endpoint): ?array
    {
        try {
            $url = $this->baseUrl . '/' . $endpoint;

            $response = Http::withHeaders($this->getHeaders())
                ->timeout($this->timeout)
                ->get($url);

            if ($response->status() === 429) {
                throw new Exception('Rate limit exceeded', 429);
            }

            if ($response->status() >= 400) {
                throw new Exception("API error: HTTP {$response->status()}", $response->status());
            }

            return $response->json();
        } catch (Exception $e) {
            Log::error("PDDIKTI API request failed: {$e->getMessage()}", [
                'endpoint' => $endpoint,
                'status' => $e->getCode()
            ]);
            throw $e;
        }
    }

    /**
     * Build endpoint URL with parameters
     */
    private function buildEndpoint(string $path, ...$args): string
    {
        $encodedArgs = array_map(function ($arg) {
            return urlencode((string) $arg);
        }, array_filter($args, function ($arg) {
            return $arg !== null;
        }));

        return $path . ($encodedArgs ? '/' . implode('/', $encodedArgs) : '');
    }

    /**
     * Validate keyword parameter
     */
    private function validateKeyword(string $keyword, int $maxLength = 100): void
    {
        if (empty(trim($keyword))) {
            throw new Exception('Keyword cannot be empty');
        }

        if (strlen($keyword) > $maxLength) {
            throw new Exception("Keyword too long (max {$maxLength} characters)");
        }
    }

    /**
     * Validate ID parameter
     */
    private function validateId(string $id, string $fieldName = 'ID'): void
    {
        if (empty(trim($id))) {
            throw new Exception("{$fieldName} cannot be empty");
        }

        if (strlen($id) < 10) {
            throw new Exception("{$fieldName} appears to be too short");
        }
    }

    /**
     * Validate semester parameter (YYYYS format)
     */
    private function validateSemester($semester, string $fieldName = 'Semester'): void
    {
        if ($semester === null) {
            throw new Exception("{$fieldName} cannot be null");
        }

        $semesterStr = (string) $semester;

        if (empty(trim($semesterStr))) {
            throw new Exception("{$fieldName} cannot be empty");
        }

        if (strlen($semesterStr) !== 5) {
            throw new Exception("{$fieldName} must be in YYYYS format (5 digits), e.g., 20241 or 20242");
        }

        try {
            $semesterInt = (int) $semesterStr;
            $year = intval($semesterInt / 10);
            $sem = $semesterInt % 10;

            if ($year < 1900 || $year > 2100) {
                throw new Exception("Year in {$fieldName} must be between 1900 and 2100");
            }

            if ($sem < 1 || $sem > 2) {
                throw new Exception("Semester digit in {$fieldName} must be 1 or 2 (got {$sem})");
            }
        } catch (Exception $e) {
            throw new Exception("{$fieldName} must be a valid semester number in YYYYS format");
        }
    }

    // Search Methods

    /**
     * Search across all categories in the PDDIKTI database
     */
    public function searchAll(string $keyword): ?array
    {
        $this->validateKeyword($keyword);
        $endpoint = $this->buildEndpoint('pencarian/all', $keyword);
        return $this->makeRequest($endpoint);
    }

    /**
     * Search for students (mahasiswa) in the PDDIKTI database
     */
    public function searchMahasiswa(string $keyword): ?array
    {
        $this->validateKeyword($keyword);
        $endpoint = $this->buildEndpoint('pencarian/mhs', $keyword);
        return $this->makeRequest($endpoint);
    }

    /**
     * Search for lecturers (dosen) in the PDDIKTI database
     */
    public function searchDosen(string $keyword): ?array
    {
        $this->validateKeyword($keyword);
        $endpoint = $this->buildEndpoint('pencarian/dosen', $keyword);
        return $this->makeRequest($endpoint);
    }

    /**
     * Search for universities (perguruan tinggi) in the PDDIKTI database
     */
    public function searchPt(string $keyword): ?array
    {
        $this->validateKeyword($keyword);
        $endpoint = $this->buildEndpoint('pencarian/pt', $keyword);
        return $this->makeRequest($endpoint);
    }

    /**
     * Search for study programs (program studi) in the PDDIKTI database
     */
    public function searchProdi(string $keyword): ?array
    {
        $this->validateKeyword($keyword);
        $endpoint = $this->buildEndpoint('pencarian/prodi', $keyword);
        return $this->makeRequest($endpoint);
    }

    // Student Detail Methods

    /**
     * Get detailed information about a specific student
     */
    public function getDetailMhs(string $mahasiswaId): ?array
    {
        $this->validateId($mahasiswaId, 'Mahasiswa ID');
        $endpoint = $this->buildEndpoint('detail/mhs', $mahasiswaId);
        return $this->makeRequest($endpoint);
    }

    // Lecturer Detail Methods

    /**
     * Get comprehensive profile information of a lecturer
     */
    public function getDosenProfile(string $dosenId): ?array
    {
        $this->validateId($dosenId, 'Dosen ID');
        $endpoint = $this->buildEndpoint('dosen/profile', $dosenId);
        return $this->makeRequest($endpoint);
    }

    /**
     * Get research activities of a lecturer
     */
    public function getDosenPenelitian(string $dosenId): ?array
    {
        $this->validateId($dosenId, 'Dosen ID');
        $endpoint = $this->buildEndpoint('dosen/portofolio/penelitian', $dosenId);
        return $this->makeRequest($endpoint);
    }

    /**
     * Get community service activities of a lecturer
     */
    public function getDosenPengabdian(string $dosenId): ?array
    {
        $this->validateId($dosenId, 'Dosen ID');
        $endpoint = $this->buildEndpoint('dosen/portofolio/pengabdian', $dosenId);
        return $this->makeRequest($endpoint);
    }

    /**
     * Get academic works of a lecturer
     */
    public function getDosenKarya(string $dosenId): ?array
    {
        $this->validateId($dosenId, 'Dosen ID');
        $endpoint = $this->buildEndpoint('dosen/portofolio/karya', $dosenId);
        return $this->makeRequest($endpoint);
    }

    /**
     * Get patents of a lecturer
     */
    public function getDosenPaten(string $dosenId): ?array
    {
        $this->validateId($dosenId, 'Dosen ID');
        $endpoint = $this->buildEndpoint('dosen/portofolio/paten', $dosenId);
        return $this->makeRequest($endpoint);
    }

    /**
     * Get study history of a lecturer
     */
    public function getDosenStudyHistory(string $dosenId): ?array
    {
        $this->validateId($dosenId, 'Dosen ID');
        $endpoint = $this->buildEndpoint('dosen/study-history', $dosenId);
        return $this->makeRequest($endpoint);
    }

    /**
     * Get teaching history of a lecturer
     */
    public function getDosenTeachingHistory(string $dosenId): ?array
    {
        $this->validateId($dosenId, 'Dosen ID');
        $endpoint = $this->buildEndpoint('dosen/teaching-history', $dosenId);
        return $this->makeRequest($endpoint);
    }

    // University Detail Methods

    /**
     * Get detailed information about a university
     */
    public function getDetailPt(string $ptId): ?array
    {
        $this->validateId($ptId, 'PT ID');
        $endpoint = $this->buildEndpoint('detail/pt', $ptId);
        return $this->makeRequest($endpoint);
    }

    /**
     * Get study programs offered by a university for a given semester
     */
    public function getProdiPt(string $ptId, $tahun): ?array
    {
        $this->validateId($ptId, 'PT ID');
        $this->validateSemester($tahun, 'Academic semester');
        $endpoint = $this->buildEndpoint('pt/prodi', $ptId, $tahun);
        return $this->makeRequest($endpoint);
    }

    /**
     * Get university logo as base64 encoded string
     */
    public function getLogoPt(string $ptId): ?string
    {
        $this->validateId($ptId, 'PT ID');

        try {
            $url = $this->baseUrl . '/pt/logo/' . urlencode($ptId);
            $response = Http::withHeaders($this->getHeaders())
                ->timeout($this->timeout)
                ->get($url);

            if ($response->successful()) {
                return base64_encode($response->body());
            }

            return null;
        } catch (Exception $e) {
            Log::error("Failed to get university logo: {$e->getMessage()}");
            return null;
        }
    }

    /**
     * Get university ratio information
     */
    public function getRasioPt(string $ptId): ?array
    {
        $this->validateId($ptId, 'PT ID');
        $endpoint = $this->buildEndpoint('pt/rasio', $ptId);
        return $this->makeRequest($endpoint);
    }

    /**
     * Get student statistics for a university
     */
    public function getMahasiswaPt(string $ptId): ?array
    {
        $this->validateId($ptId, 'PT ID');
        $endpoint = $this->buildEndpoint('pt/mahasiswa', $ptId);
        return $this->makeRequest($endpoint);
    }

    /**
     * Get study time statistics for a university
     */
    public function getWaktuStudiPt(string $ptId): ?array
    {
        $this->validateId($ptId, 'PT ID');
        $endpoint = $this->buildEndpoint('pt/waktu-studi', $ptId);
        return $this->makeRequest($endpoint);
    }

    // Study Program Detail Methods

    /**
     * Get detailed information about a study program
     */
    public function getDetailProdi(string $prodiId): ?array
    {
        $this->validateId($prodiId, 'Prodi ID');
        $endpoint = $this->buildEndpoint('prodi/detail', $prodiId);
        return $this->makeRequest($endpoint);
    }

    /**
     * Get description and statistics of a study program
     */
    public function getDescProdi(string $prodiId): ?array
    {
        $this->validateId($prodiId, 'Prodi ID');
        $endpoint = $this->buildEndpoint('prodi/desc', $prodiId);
        return $this->makeRequest($endpoint);
    }

    /**
     * Get name history of a study program
     */
    public function getNameHistoriesProdi(string $prodiId): ?array
    {
        $this->validateId($prodiId, 'Prodi ID');
        $endpoint = $this->buildEndpoint('prodi/name-histories', $prodiId);
        return $this->makeRequest($endpoint);
    }

    /**
     * Get student and lecturer counts for a study program
     */
    public function getNumStudentsLecturersProdi(string $prodiId): ?array
    {
        $this->validateId($prodiId, 'Prodi ID');
        $endpoint = $this->buildEndpoint('prodi/num-students-lecturers', $prodiId);
        return $this->makeRequest($endpoint);
    }

    /**
     * Get cost range for a study program
     */
    public function getCostRangeProdi(string $prodiId): ?array
    {
        $this->validateId($prodiId, 'Prodi ID');
        $endpoint = $this->buildEndpoint('prodi/cost-range', $prodiId);
        return $this->makeRequest($endpoint);
    }

    /**
     * Get capacity information for a study program
     */
    public function getDayaTampungProdi(string $prodiId): ?array
    {
        $this->validateId($prodiId, 'Prodi ID');
        $endpoint = $this->buildEndpoint('prodi/daya-tampung', $prodiId);
        return $this->makeRequest($endpoint);
    }

    /**
     * Get lecturer-student ratio for a study program
     */
    public function getRasioDosenMahasiswaProdi(string $prodiId): ?array
    {
        $this->validateId($prodiId, 'Prodi ID');
        $endpoint = $this->buildEndpoint('prodi/rasio-dosen-mahasiswa', $prodiId);
        return $this->makeRequest($endpoint);
    }

    /**
     * Get graduation rate for a study program
     */
    public function getGraduationRateProdi(string $prodiId): ?array
    {
        $this->validateId($prodiId, 'Prodi ID');
        $endpoint = $this->buildEndpoint('prodi/graduation-rate', $prodiId);
        return $this->makeRequest($endpoint);
    }

    // Count Methods

    /**
     * Get count of active lecturers
     */
    public function getDosenCountActive(): ?array
    {
        $endpoint = 'dosen/count-active';
        return $this->makeRequest($endpoint);
    }

    /**
     * Get count of active students
     */
    public function getMahasiswaCountActive(): ?array
    {
        $endpoint = 'mahasiswa/count-active';
        return $this->makeRequest($endpoint);
    }

    /**
     * Get count of study programs
     */
    public function getProdiCount(): ?array
    {
        $endpoint = 'prodi/count';
        return $this->makeRequest($endpoint);
    }

    /**
     * Get count of universities
     */
    public function getPtCount(): ?array
    {
        $endpoint = 'pt/count';
        return $this->makeRequest($endpoint);
    }

    // Visualization Methods

    /**
     * Get lecturer activity data
     */
    public function getDataDosenKeaktifan(): ?array
    {
        $endpoint = 'visualisasi/dosen-keaktifan';
        return $this->makeRequest($endpoint);
    }

    /**
     * Get lecturer field distribution data
     */
    public function getDataDosenBidang(): ?array
    {
        $endpoint = 'visualisasi/dosen-bidang';
        return $this->makeRequest($endpoint);
    }

    /**
     * Get lecturer gender distribution data
     */
    public function getDataDosenJenisKelamin(): ?array
    {
        $endpoint = 'visualisasi/dosen-jenis-kelamin';
        return $this->makeRequest($endpoint);
    }

    /**
     * Get lecturer education level data
     */
    public function getDataDosenJenjang(): ?array
    {
        $endpoint = 'visualisasi/dosen-jenjang';
        return $this->makeRequest($endpoint);
    }

    /**
     * Get lecturer employment binding data
     */
    public function getDataDosenIkatan(): ?array
    {
        $endpoint = 'visualisasi/dosen-ikatan';
        return $this->makeRequest($endpoint);
    }

    /**
     * Get student field distribution data
     */
    public function getDataMahasiswaBidang(): ?array
    {
        $endpoint = 'visualisasi/mahasiswa-bidang';
        return $this->makeRequest($endpoint);
    }

    /**
     * Get student gender distribution data
     */
    public function getDataMahasiswaJenisKelamin(): ?array
    {
        $endpoint = 'visualisasi/mahasiswa-jenis-kelamin';
        return $this->makeRequest($endpoint);
    }

    /**
     * Get student education level data
     */
    public function getDataMahasiswaJenjang(): ?array
    {
        $endpoint = 'visualisasi/mahasiswa-jenjang';
        return $this->makeRequest($endpoint);
    }

    /**
     * Get student institutional group data
     */
    public function getDataMahasiswaKelompokLembaga(): ?array
    {
        $endpoint = 'visualisasi/mahasiswa-kelompok-lembaga';
        return $this->makeRequest($endpoint);
    }

    /**
     * Get student status data
     */
    public function getDataMahasiswaStatus(): ?array
    {
        $endpoint = 'visualisasi/mahasiswa-status';
        return $this->makeRequest($endpoint);
    }

    /**
     * Get university type data
     */
    public function getDataPtBentuk(): ?array
    {
        $endpoint = 'visualisasi/pt-bentuk';
        return $this->makeRequest($endpoint);
    }

    /**
     * Get university accreditation data
     */
    public function getDataPtAkreditasi(): ?array
    {
        $endpoint = 'visualisasi/pt-akreditasi';
        return $this->makeRequest($endpoint);
    }

    /**
     * Get university administrative overseer data
     */
    public function getDataPtKelompokPembina(): ?array
    {
        $endpoint = 'visualisasi/pt-kelompok-pembina';
        return $this->makeRequest($endpoint);
    }

    /**
     * Get university province distribution data
     */
    public function getDataPtProvinsi(): ?array
    {
        $endpoint = 'visualisasi/pt-provinsi';
        return $this->makeRequest($endpoint);
    }

    /**
     * Get study program level data
     */
    public function getDataProdiJenjang(): ?array
    {
        $endpoint = 'visualisasi/prodi-jenjang';
        return $this->makeRequest($endpoint);
    }

    /**
     * Get study program accreditation data
     */
    public function getDataProdiAkreditasi(): ?array
    {
        $endpoint = 'visualisasi/prodi-akreditasi';
        return $this->makeRequest($endpoint);
    }

    /**
     * Get study program field of science data
     */
    public function getDataProdiBidangIlmu(): ?array
    {
        $endpoint = 'visualisasi/prodi-bidang-ilmu';
        return $this->makeRequest($endpoint);
    }

    /**
     * Get study program administrative overseer data
     */
    public function getDataProdiKelompokPembina(): ?array
    {
        $endpoint = 'visualisasi/prodi-kelompok-pembina';
        return $this->makeRequest($endpoint);
    }

    // Additional Methods

    /**
     * Get contributor information
     */
    public function getContributor(): ?array
    {
        $endpoint = 'contributor/contributor';
        return $this->makeRequest($endpoint);
    }

    /**
     * Get news articles
     */
    public function getNews(): ?array
    {
        $endpoint = 'news/list';
        return $this->makeRequest($endpoint);
    }

    /**
     * Get field of sciences
     */
    public function getBidangIlmuProdi(): ?array
    {
        $endpoint = 'prodi/bidang-ilmu';
        return $this->makeRequest($endpoint);
    }

    /**
     * Verify graduation status based on current status
     */
    private function verifyIjazahStatus(string $statusSaatIni): array
    {
        $status = explode('-', strtoupper($statusSaatIni))[0];
        $semester = explode('-', strtoupper($statusSaatIni))[1];

        // Check for graduation status
        if (in_array($status, ['LULUS', 'GRADUATED', 'ALUMNI'])) {
            return [
                'status' => 'GRADUATED',
                'semester' => $semester,
                'valid' => true,
                'message' => 'Mahasiswa telah lulus',
                'icon' => '✅'
            ];
        }

        // Check for active student status
        if (in_array($status, ['AKTIF', 'ACTIVE', 'MAHASISWA AKTIF', 'TIDAK AKTIF', 'NON-AKTIF'])) {
            $status = 'NOT_GRADUATED';
            if (in_array($status, ['TIDAK AKTIF', 'NON-AKTIF'])) {
                $status = 'NON_ACTIVE';
            } elseif (in_array($status, ['AKTIF', 'ACTIVE', 'MAHASISWA AKTIF'])) {
                $status = 'ACTIVE';
            }
            return [
                'status' => $status,
                'semester' => $semester,
                'valid' => false,
                'message' => 'Mahasiswa masih belum lulus',
                'icon' => '🟡'
            ];
        }

        // Check for dropout status
        if (in_array($status, ['DO', 'DROPOUT', 'KELUAR', 'DIKELUARKAN', 'MENGAJUKAN PENGUNDURAN DIRI', 'PENGUNDURAN DIRI', 'PENGUNDURAN DIRI DITERIMA'])) {
            return [
                'status' => 'DROPOUT',
                'semester' => $semester,
                'valid' => false,
                'message' => 'Mahasiswa tidak aktif/keluar',
                'icon' => '❌'
            ];
        }

        // Check for other statuses that might indicate graduation
        if (strpos($status, 'LULUS') !== false || strpos($status, 'GRADUATED') !== false) {
            return [
                'status' => 'GRADUATED',
                'semester' => $semester,
                'valid' => true,
                'message' => 'Mahasiswa telah lulus',
                'icon' => '✅'
            ];
        }

        // Unknown status
        return [
            'status' => 'UNKNOWN',
            'semester' => $semester,
            'valid' => false,
            'message' => 'Status mahasiswa tidak diketahui, ' . $status,
            'icon' => '❓'
        ];
    }

    /**
     * Check student graduation status based on search criteria
     */
    public function checkStatusKelulusan(array $criteria): array
    {
        $nama = trim($criteria['nama'] ?? '');
        $nim = trim($criteria['nim'] ?? '');
        $programStudi = trim($criteria['program_studi'] ?? '');
        $universitas = trim($criteria['universitas'] ?? '');

        // Validate input - at least one field must be provided
        if (empty($nama) && empty($nim) && empty($programStudi) && empty($universitas)) {
            throw new Exception("At least one of 'nama', 'nim', 'program_studi', or 'universitas' must be provided");
        }

        $searchResults = [];
        $fallbackUsed = false;

        try {
            // Build search keyword from all provided criteria
            $searchKeywords = [];
            if ($nama) $searchKeywords[] = $nama;
            if ($programStudi) $searchKeywords[] = $programStudi;
            if ($universitas) $searchKeywords[] = $universitas;
            if ($nim) $searchKeywords[] = $nim;

            if (!empty($searchKeywords)) {
                // First attempt: Search with all provided criteria
                $combinedKeyword = implode(' ', $searchKeywords);

                // Use search_all to search across all categories at once
                $allResults = $this->searchAll($combinedKeyword);

                Log::info("Search results for keyword '{$combinedKeyword}':", ['results' => $allResults]);

                if ($allResults) {
                    // Extract mahasiswa data from the search_all results
                    if (is_array($allResults)) {
                        // Check if it's an associative array with 'mahasiswa' key
                        if (isset($allResults['mahasiswa']) && is_array($allResults['mahasiswa'])) {
                            $searchResults = array_merge($searchResults, $allResults['mahasiswa']);
                        } else {
                            // Check if it's an indexed array with alternating keys and values
                            $allResultsValues = array_values($allResults);
                            for ($i = 0; $i < count($allResultsValues); $i++) {
                                if ($allResultsValues[$i] === 'mahasiswa' && $i + 1 < count($allResultsValues)) {
                                    $mahasiswaData = $allResultsValues[$i + 1];
                                    if (is_array($mahasiswaData)) {
                                        $searchResults = array_merge($searchResults, $mahasiswaData);
                                    }
                                    break;
                                }
                            }
                        }
                    }
                }

                // Fallback strategy: If no results found and program_studi was provided,
                // try searching again without program_studi (in case of typos in program name)
                if (empty($searchResults) && $programStudi && ($nama || $universitas)) {
                    $fallbackUsed = true;

                    // Build fallback search keyword (exclude program_studi)
                    $fallbackKeywords = [];
                    if ($nama) $fallbackKeywords[] = $nama;
                    if ($universitas) $fallbackKeywords[] = $universitas;
                    if ($nim) $fallbackKeywords[] = $nim;

                    if (!empty($fallbackKeywords)) {
                        $fallbackKeyword = implode(' ', $fallbackKeywords);

                        // Try search_all again without program_studi
                        $fallbackResults = $this->searchAll($fallbackKeyword);

                        Log::info("Fallback search results for keyword '{$fallbackKeyword}':", ['results' => $fallbackResults]);

                        if ($fallbackResults) {
                            if (is_array($fallbackResults)) {
                                // Check if it's an associative array with 'mahasiswa' key
                                if (isset($fallbackResults['mahasiswa']) && is_array($fallbackResults['mahasiswa'])) {
                                    $searchResults = array_merge($searchResults, $fallbackResults['mahasiswa']);
                                } else {
                                    // Check if it's an indexed array with alternating keys and values
                                    $fallbackResultsValues = array_values($fallbackResults);
                                    for ($i = 0; $i < count($fallbackResultsValues); $i++) {
                                        if ($fallbackResultsValues[$i] === 'mahasiswa' && $i + 1 < count($fallbackResultsValues)) {
                                            $mahasiswaData = $fallbackResultsValues[$i + 1];
                                            if (is_array($mahasiswaData)) {
                                                $searchResults = array_merge($searchResults, $mahasiswaData);
                                            }
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // Apply additional filters based on provided criteria
            if (!empty($searchResults)) {
                // Filter by nama if provided
                if ($nama) {
                    $searchResults = array_filter($searchResults, function ($mhs) use ($nama) {
                        return stripos($mhs['nama'] ?? '', $nama) !== false;
                    });
                }

                // Only filter by program_studi if fallback search was NOT used
                if ($programStudi && !$fallbackUsed) {
                    $searchResults = array_filter($searchResults, function ($mhs) use ($programStudi) {
                        return stripos($mhs['nama_prodi'] ?? '', $programStudi) !== false;
                    });
                }

                // Filter by universitas if provided
                if ($universitas) {
                    $searchResults = array_filter($searchResults, function ($mhs) use ($universitas) {
                        return stripos($mhs['nama_pt'] ?? '', $universitas) !== false;
                    });
                }

                // Reset array keys after filtering
                $searchResults = array_values($searchResults);
            }

            // Remove duplicates based on ID
            $uniqueResults = [];
            $seenIds = [];
            foreach ($searchResults as $mhs) {
                $id = $mhs['id'] ?? null;
                if ($id && !in_array($id, $seenIds)) {
                    $uniqueResults[] = $mhs;
                    $seenIds[] = $id;
                }
            }

            // Get detailed information for each result
            $detailedResults = [];
            foreach ($uniqueResults as $mhs) {
                try {
                    $detail = $this->getDetailMhs($mhs['id']);

                    if ($detail) {
                        // Verify ijazah status
                        $ijazahVerification = $this->verifyIjazahStatus($detail['status_saat_ini'] ?? '');

                        $detailedResults[] = [
                            'nama' => $detail['nama'] ?? $mhs['nama'] ?? '',
                            'nim' => $detail['nim'] ?? $mhs['nim'] ?? '',
                            'program_studi' => $detail['nama_prodi'] ?? $mhs['nama_prodi'] ?? '',
                            'universitas' => $detail['nama_pt'] ?? $mhs['nama_pt'] ?? '',
                            'jenis_kelamin' => $detail['jenis_kelamin'] ?? null,
                            'tempat_lahir' => $detail['tempat_lahir'] ?? null,
                            'tanggal_lahir' => $detail['tanggal_lahir'] ?? null,
                            'nama_ibu' => $detail['nama_ibu'] ?? null,
                            'jenjang' => $detail['jenjang'] ?? null,
                            'tahun_masuk' => $detail['tahun_masuk'] ?? null,
                            'status_saat_ini' => $detail['status_saat_ini'] ?? null,
                            'ijazah_verification' => $ijazahVerification
                        ];
                    } else {
                        // If detail not available, return basic info only
                        $detailedResults[] = [
                            'nama' => $mhs['nama'] ?? '',
                            'nim' => $mhs['nim'] ?? '',
                            'program_studi' => $mhs['nama_prodi'] ?? '',
                            'universitas' => $mhs['nama_pt'] ?? '',
                            'jenis_kelamin' => null,
                            'tempat_lahir' => null,
                            'tanggal_lahir' => null,
                            'nama_ibu' => null,
                            'jenjang' => null,
                            'tahun_masuk' => null,
                            'status_saat_ini' => null,
                            'ijazah_verification' => [
                                'status' => 'UNKNOWN',
                                'valid' => false,
                                'message' => 'Detail mahasiswa tidak dapat diambil',
                                'icon' => '❓'
                            ]
                        ];
                    }
                } catch (Exception $e) {
                    Log::error("Error getting detail for mahasiswa {$mhs['id']}: {$e->getMessage()}");
                    continue;
                }
            }

            return [
                'success' => true,
                'message' => count($detailedResults) > 0 ? "Ditemukan " . count($detailedResults) . " mahasiswa" : "Data mahasiswa tidak ditemukan",
                'total_found' => count($detailedResults),
                'search_criteria' => [
                    'nama' => $nama ?: null,
                    'nim' => $nim ?: null,
                    'program_studi' => $programStudi ?: null,
                    'universitas' => $universitas ?: null
                ],
                'search_info' => [
                    'fallback_used' => $fallbackUsed,
                    'note' => $fallbackUsed ? "Fallback search digunakan (tanpa program studi) karena kemungkinan ada kesalahan penulisan nama program studi" : null
                ],
                'results' => $detailedResults
            ];
        } catch (Exception $e) {
            Log::error("Error during graduation status check: {$e->getMessage()}");
            throw $e;
        }
    }
}
