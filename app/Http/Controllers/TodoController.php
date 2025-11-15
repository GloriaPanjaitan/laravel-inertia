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
    public function index()
    {
        $todos = Auth::user()->todos()
            ->latest()
            ->paginate(15)
            ->through(function ($todo) {
                // tambahkan url cover jika ada
                return array_merge($todo->toArray(), [
                    'cover_url' => $todo->cover ? asset('storage/' . $todo->cover) : null,
                ]);
            });

        return Inertia::render('app/TodoPage', [
            'todos' => $todos,
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

        return redirect()->route('todos.index')->with('success', 'Aktivitas berhasil dihapus!');
    }
}
