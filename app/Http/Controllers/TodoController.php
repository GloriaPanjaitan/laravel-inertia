<?php

namespace App\Http\Controllers;

use App\Models\Todo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class TodoController extends Controller
{
    // Index: tampilkan list (paginated)
    public function index(Request $request)
    {
        // Mendapatkan query builder untuk todo milik pengguna saat ini
        $query = Auth::user()->todos()->latest();

        // --- Menerapkan Filter Pencarian (Search Filter) ---
        $search = $request->input('search');
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // --- Menerapkan Filter Status (Status Filter) ---
        $status = $request->input('status', 'all'); // Default 'all'
        if ($status === 'finished') {
            $query->where('is_finished', true);
        } elseif ($status === 'pending') {
            $query->where('is_finished', false);
        }
        // Jika status adalah 'all', tidak perlu menambah klausa where

        // Mendapatkan data dengan pagination setelah filter diterapkan
        $todos = $query
            ->paginate(20)
            ->withQueryString() // Memastikan parameter filter tetap ada di pagination links
            ->through(function ($todo) {
                // tambahkan url cover jika ada
                return array_merge($todo->toArray(), [
                    'cover_url' => $todo->cover ? asset('storage/' . $todo->cover) : null,
                ]);
            });

        // Data yang dikirim ke frontend Inertia
        return Inertia::render('app/TodoPage', [
            'todos' => $todos,
            // Mengirim kembali filter yang aktif agar state di frontend tetap sinkron
            'filters' => [
                'search' => $search,
                'status' => $status,
            ]
        ]);
    }

    // Store: buat todo baru (dengan optional cover)
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'cover' => 'nullable|image|max:2048',
        ]);

        $coverPath = null;
        if ($request->hasFile('cover')) {
            $coverPath = $request->file('cover')->store('todos/covers', 'public');
        }

        Auth::user()->todos()->create([
            'title' => $request->title,
            'description' => $request->description,
            'cover' => $coverPath,
            'is_finished' => false,
        ]);

        return redirect()->route('todos.index')->with('success', 'Aktivitas berhasil ditambahkan!');
    }

    // Update: ubah todo
    public function update(Request $request, Todo $todo)
    {
        if (Auth::id() !== $todo->user_id) {
            return back()->with('error', 'Anda tidak memiliki akses.');
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_finished' => 'sometimes|boolean',
        ]);

        $todo->update([
            'title' => $request->title,
            'description' => $request->description,
            'is_finished' => $request->has('is_finished') ? (bool) $request->is_finished : $todo->is_finished,
        ]);

        // Menggunakan back() agar tetap pada halaman dan filter saat ini
        return back()->with('success', 'Aktivitas berhasil diperbarui!');
    }

    // Update cover (upload)
    public function updateCover(Request $request, Todo $todo)
    {
        if (Auth::id() !== $todo->user_id) {
            return back()->with('error', 'Anda tidak memiliki akses.');
        }

        $request->validate([
            'cover' => 'required|image|max:2048',
        ]);

        if ($todo->cover) {
            Storage::disk('public')->delete($todo->cover);
        }

        $newCoverPath = $request->file('cover')->store('todos/covers', 'public');
        $todo->update(['cover' => $newCoverPath]);

        return back()->with('success', 'Cover berhasil diperbarui!');
    }

    // Destroy: hapus todo
    public function destroy(Todo $todo)
    {
        if (Auth::id() !== $todo->user_id) {
            return back()->with('error', 'Anda tidak memiliki akses.');
        }

        if ($todo->cover) {
            Storage::disk('public')->delete($todo->cover);
        }

        $todo->delete();

        // Menggunakan back() agar tetap pada halaman dan filter saat ini
        return back()->with('success', 'Aktivitas berhasil dihapus!');
    }
}