<?php

namespace App\Http\Resources\General;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LocationResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'name'         => $this->name,
            'slug'         => $this->slug,
            'image_url'    => $this->image_url,
            'is_popular'   => (bool) $this->is_popular,
            'description'  => $this->description,
            'country_code' => $this->country_code ?? 'VN',
            'parent_id'    => $this->parent_id,
            'parent'       => new LocationResource($this->whenLoaded('parent')),
            'children'     => LocationResource::collection($this->whenLoaded('children')),
        ];
    }
}
