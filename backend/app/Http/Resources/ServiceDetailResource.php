<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ServiceDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'type' => $this->type,
            'status' => $this->status,
            'description' => $this->description,
            'base_price' => (float) ($this->base_price ?? $this->price ?? 0),
            'price_unit' => $this->price_unit,
            'max_guests' => (int) ($this->max_guests ?? $this->max_guest ?? 0),
            'duration_days' => (int) $this->duration_days,
            'duration_nights' => (int) $this->duration_nights,
            'address' => $this->address,
            'rating_avg' => (float) ($this->rating_avg ?? 0),
            'total_reviews' => (int) ($this->total_reviews ?? $this->reviews()->count()),
            'total_bookings' => (int) ($this->total_bookings ?? $this->bookings()->count()),
            'amenities' => $this->amenities ?? [],
            'includes' => $this->includes ?? [],
            'excludes' => $this->excludes ?? [],
            'tags' => $this->tags ?? [],
            'media' => $this->media->map(fn($m) => [
                'id' => $m->id,
                'url' => $m->url,
                'is_cover' => $m->is_cover,
            ]),
            'schedules' => $this->schedules->map(fn($s) => [
                'id' => $s->id,
                'day_number' => (int) $s->day_number,
                'title' => $s->title,
                'description' => $s->description,
                'time' => $s->time,
            ])->sortBy('day_number')->values(),
            'provider' => $this->when($this->relationLoaded('provider'), function () {
                return [
                    'id' => $this->provider->id,
                    'business_name' => $this->provider->business_name,
                    'contact_phone' => $this->provider->contact_phone,
                    'avatar_url' => $this->provider->avatar_url,
                ];
            }),
            'location' => $this->when($this->relationLoaded('location'), function () {
                return $this->location ? [
                    'id' => $this->location->id,
                    'name' => $this->location->name,
                    'slug' => $this->location->slug,
                ] : null;
            }),
            'category' => $this->when($this->relationLoaded('category'), function () {
                return $this->category ? [
                    'id' => $this->category->id,
                    'name' => $this->category->name,
                    'slug' => $this->category->slug,
                ] : null;
            }),
            'reviews' => $this->when($this->relationLoaded('reviews'), function () {
                return $this->reviews->map(fn($r) => [
                    'id' => $r->id,
                    'user_id' => $r->user_id,
                    'rating' => (int) $r->rating,
                    'content' => $r->content,
                    'images' => $r->images ?? [],
                    'created_at' => $r->created_at?->toIso8601String(),
                    'user' => $r->user ? [
                        'id' => $r->user->id,
                        'display_name' => $r->user->display_name,
                        'avatar_url' => $r->user->avatar_url,
                    ] : null,
                ]);
            }),
            'room_types' => $this->when($this->relationLoaded('roomTypes'), function () {
                return $this->roomTypes->map(fn($rt) => [
                    'id' => $rt->id,
                    'name' => $rt->name,
                    'rank' => $rt->rank,
                    'description' => $rt->description,
                    'base_price' => (float) $rt->base_price,
                    'total_rooms' => (int) $rt->total_rooms,
                    'capacity_adults' => (int) $rt->capacity_adults,
                    'capacity_children' => (int) $rt->capacity_children,
                    'amenities' => $rt->amenities ?? [],
                    'images' => $rt->images ?? [],
                    'status' => $rt->status,
                ]);
            }),
        ];
    }
}
