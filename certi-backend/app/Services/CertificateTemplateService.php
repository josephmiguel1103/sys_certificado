<?php

namespace App\Services;

use App\Models\CertificateTemplate;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CertificateTemplateService
{
    /**
     * Obtener todas las plantillas con paginación
     *
     * @param int $perPage
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    public function getAll(int $perPage = 15)
    {
        return CertificateTemplate::with(['certificates'])
            ->withCount('certificates')
            ->paginate($perPage);
    }

    /**
     * Obtener plantilla por ID
     *
     * @param int $id
     * @return CertificateTemplate|null
     */
    public function getById(int $id): ?CertificateTemplate
    {
        return CertificateTemplate::with(['certificates'])
            ->withCount('certificates')
            ->find($id);
    }

    /**
     * Crear nueva plantilla
     *
     * @param array $data
     * @return CertificateTemplate
     */
    public function create(array $data): CertificateTemplate
    {
        return DB::transaction(function () use ($data) {
            $template = CertificateTemplate::create($data);

            Log::info('Plantilla de certificado creada exitosamente', ['template_id' => $template->id]);

            return $template;
        });
    }

    /**
     * Actualizar plantilla
     *
     * @param CertificateTemplate $template
     * @param array $data
     * @return CertificateTemplate
     */
    public function update(CertificateTemplate $template, array $data): CertificateTemplate
    {
        return DB::transaction(function () use ($template, $data) {
            Log::info('Datos recibidos para actualizar plantilla:', [
                'template_id' => $template->id,
                'data' => $data
            ]);

            $template->update($data);

            Log::info('Plantilla de certificado actualizada exitosamente', [
                'template_id' => $template->id,
                'updated_fields' => array_keys($data)
            ]);

            $freshTemplate = $template->fresh();

            Log::info('Plantilla después de actualizar:', [
                'id' => $freshTemplate->id,
                'name' => $freshTemplate->name,
                'description' => $freshTemplate->description,
                'activity_type' => $freshTemplate->activity_type,
                'status' => $freshTemplate->status
            ]);

            return $freshTemplate;
        });
    }

    /**
     * Eliminar plantilla
     *
     * @param CertificateTemplate $template
     * @return bool
     */
    public function delete(CertificateTemplate $template): bool
    {
        return DB::transaction(function () use ($template) {
            // Verificar si tiene certificados asociados
            if ($template->certificates()->count() > 0) {
                throw new \Exception('No se puede eliminar la plantilla porque tiene certificados asociados');
            }

            $templateId = $template->id;
            $deleted = $template->delete();

            if ($deleted) {
                Log::info('Plantilla de certificado eliminada exitosamente', ['template_id' => $templateId]);
            }

            return $deleted;
        });
    }

    /**
     * Buscar plantillas por criterios
     *
     * @param array $criteria
     * @param int $perPage
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    public function search(array $criteria, int $perPage = 15)
    {
        $query = CertificateTemplate::with(['certificates'])
            ->withCount('certificates');

        if (isset($criteria['search'])) {
            $search = $criteria['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if (isset($criteria['activity_type'])) {
            $query->where('activity_type', $criteria['activity_type']);
        }

        if (isset($criteria['status'])) {
            $query->where('status', $criteria['status']);
        }

        if (isset($criteria['is_active'])) {
            $query->where('is_active', $criteria['is_active']);
        }

        return $query->paginate($perPage);
    }

    /**
     * Obtener plantillas por empresa (método obsoleto - ya no se usa company)
     *
     * @param int $companyId
     * @param int $perPage
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    public function getByCompany(int $companyId, int $perPage = 15)
    {
        // Este método ya no es necesario ya que eliminamos la relación con company
        // Devolvemos todas las plantillas en su lugar
        return $this->getAll($perPage);
    }

    /**
     * Activar/Desactivar plantilla
     *
     * @param CertificateTemplate $template
     * @param bool $status
     * @return CertificateTemplate
     */
    public function toggleStatus(CertificateTemplate $template, bool $status): CertificateTemplate
    {
        $statusValue = $status ? 'active' : 'inactive';
        $template->update(['status' => $statusValue]);

        Log::info('Estado de plantilla actualizado', [
            'template_id' => $template->id,
            'new_status' => $statusValue
        ]);

        return $template->fresh();
    }

    /**
     * Clonar plantilla
     *
     * @param CertificateTemplate $template
     * @param array $newData
     * @return CertificateTemplate
     */
    public function clone(CertificateTemplate $template, array $newData = []): CertificateTemplate
    {
        return DB::transaction(function () use ($template, $newData) {
            $clonedData = $template->toArray();

            // Remover campos que no deben clonarse
            unset($clonedData['id'], $clonedData['created_at'], $clonedData['updated_at']);

            // Aplicar nuevos datos
            $clonedData = array_merge($clonedData, $newData);

            // Agregar sufijo al nombre si no se proporciona uno nuevo
            if (!isset($newData['name'])) {
                $clonedData['name'] = $template->name . ' (Copia)';
            }

            $clonedTemplate = CertificateTemplate::create($clonedData);

            Log::info('Plantilla clonada exitosamente', [
                'original_template_id' => $template->id,
                'cloned_template_id' => $clonedTemplate->id
            ]);

            return $clonedTemplate;
        });
    }
}
