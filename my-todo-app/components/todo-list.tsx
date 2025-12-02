"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { X, GripVertical, CheckCircle2, Clock, MessageSquare, Send } from "lucide-react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Comment {
  id: number;
  author: string;
  text: string;
  timestamp: number;
}

interface Task {
  id: number;
  text: string;
  completed: boolean;
  comments: Comment[];
}

interface TaskCardProps {
  task: Task;
  currentUserName: string;
  onToggleComplete: (id: number) => void;
  onDelete: (id: number) => void;
  onAddComment: (taskId: number, commentText: string) => void;
}

function TaskCard({ task, currentUserName, onToggleComplete, onDelete, onAddComment }: TaskCardProps) {
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleAddComment = () => {
    if (commentText.trim()) {
      onAddComment(task.id, commentText.trim());
      setCommentText("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAddComment();
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group bg-card border rounded-lg shadow-sm hover:shadow-md transition-all ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <div className="flex items-start gap-3 p-4">
        <div
          {...attributes}
          {...listeners}
          className="mt-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
        >
          <GripVertical className="h-5 w-5" />
        </div>
        <Checkbox
          id={`task-${task.id}`}
          checked={task.completed}
          onCheckedChange={() => onToggleComplete(task.id)}
          className="mt-1"
        />
        <div className="flex-1 space-y-2">
          <label
            htmlFor={`task-${task.id}`}
            className={`cursor-pointer text-sm leading-relaxed block ${
              task.completed ? "line-through text-muted-foreground" : ""
            }`}
          >
            {task.text}
          </label>

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <MessageSquare className="h-3 w-3" />
            <span>{task.comments.length} コメント</span>
          </button>

          {showComments && (
            <div className="space-y-3 mt-3">
              {/* コメント一覧 */}
              <div className="space-y-2">
                {task.comments.length > 0 ? (
                  task.comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="bg-muted/50 rounded p-2 text-xs"
                    >
                      <div className="font-semibold text-foreground">
                        {comment.author}
                      </div>
                      <div className="text-muted-foreground mt-1">
                        {comment.text}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-muted-foreground text-center py-2">
                    コメントはありません
                  </div>
                )}
              </div>

              {/* コメント入力欄 */}
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="コメントを入力..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 h-8 text-xs"
                />
                <Button
                  onClick={handleAddComment}
                  size="sm"
                  className="h-8 px-2"
                >
                  <Send className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
        </div>
        <button
          onClick={() => onDelete(task.id)}
          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all p-1 rounded hover:bg-destructive/10"
          aria-label="タスクを削除"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

interface ColumnProps {
  title: string;
  tasks: Task[];
  icon: React.ReactNode;
  currentUserName: string;
  onToggleComplete: (id: number) => void;
  onDelete: (id: number) => void;
  onAddComment: (taskId: number, commentText: string) => void;
  emptyMessage: string;
}

function Column({
  title,
  tasks,
  icon,
  currentUserName,
  onToggleComplete,
  onDelete,
  onAddComment,
  emptyMessage,
}: ColumnProps) {
  return (
    <div className="flex-1 min-w-[280px]">
      <Card className="h-full">
        <div className="p-4 border-b bg-muted/30">
          <div className="flex items-center gap-2">
            {icon}
            <h3 className="font-semibold text-lg">{title}</h3>
            <span className="ml-auto text-sm text-muted-foreground bg-muted px-2 py-1 rounded-full">
              {tasks.length}
            </span>
          </div>
        </div>
        <div className="p-4 space-y-3 min-h-[400px]">
          {tasks.length > 0 ? (
            <SortableContext
              items={tasks.map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  currentUserName={currentUserName}
                  onToggleComplete={onToggleComplete}
                  onDelete={onDelete}
                  onAddComment={onAddComment}
                />
              ))}
            </SortableContext>
          ) : (
            <div className="flex items-center justify-center h-full text-center text-muted-foreground text-sm py-12">
              {emptyMessage}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

interface TodoListProps {
  userId: string;
  userName: string;
}

export function TodoList({ userId, userName }: TodoListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [nextId, setNextId] = useState(1);
  const [activeId, setActiveId] = useState<number | null>(null);
  const isInitialMount = useRef(true);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // ローカルストレージからユーザーのタスクを読み込む
  useEffect(() => {
    isInitialMount.current = true;
    const savedTasks = localStorage.getItem(`tasks_${userId}`);
    if (savedTasks) {
      const parsedTasks = JSON.parse(savedTasks);
      // 古いタスクにcommentsプロパティがない場合は空配列を追加（マイグレーション）
      const migratedTasks = parsedTasks.map((task: Task) => ({
        ...task,
        comments: task.comments || [],
      }));
      setTasks(migratedTasks);
      // 次のIDを設定
      const maxId = migratedTasks.reduce((max: number, task: Task) =>
        Math.max(max, task.id), 0);
      setNextId(maxId + 1);
    } else {
      setTasks([]);
      setNextId(1);
    }
    // 次のレンダリングサイクルで初期マウントフラグをリセット
    setTimeout(() => {
      isInitialMount.current = false;
    }, 0);
  }, [userId]);

  // タスクが変更されたらローカルストレージに保存（初回マウント時はスキップ）
  useEffect(() => {
    if (!isInitialMount.current) {
      localStorage.setItem(`tasks_${userId}`, JSON.stringify(tasks));
    }
  }, [tasks, userId]);

  const handleAddTask = () => {
    if (inputValue.trim() !== "") {
      const newTask: Task = {
        id: nextId,
        text: inputValue.trim(),
        completed: false,
        comments: [],
      };
      setTasks([...tasks, newTask]);
      setInputValue("");
      setNextId(nextId + 1);
    }
  };

  const handleToggleComplete = (id: number) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleDeleteTask = (id: number) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const handleAddComment = (taskId: number, commentText: string) => {
    setTasks(
      tasks.map((task) => {
        if (task.id === taskId) {
          const newComment: Comment = {
            id: Date.now(),
            author: userName,
            text: commentText,
            timestamp: Date.now(),
          };
          return {
            ...task,
            comments: [...task.comments, newComment],
          };
        }
        return task;
      })
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAddTask();
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as number);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    if (active.id !== over.id) {
      setTasks((tasks) => {
        const oldIndex = tasks.findIndex((task) => task.id === active.id);
        const newIndex = tasks.findIndex((task) => task.id === over.id);

        const newTasks = [...tasks];
        const [movedTask] = newTasks.splice(oldIndex, 1);
        newTasks.splice(newIndex, 0, movedTask);

        return newTasks;
      });
    }
  };

  const pendingTasks = tasks.filter((task) => !task.completed);
  const completedTasks = tasks.filter((task) => task.completed);
  const activeTask = tasks.find((task) => task.id === activeId);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">新しいタスクを追加</h2>
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="新しいタスクを入力..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
          />
          <Button onClick={handleAddTask} size="lg">
            追加
          </Button>
        </div>
      </Card>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Column
            title="未完了"
            tasks={pendingTasks}
            icon={<Clock className="h-5 w-5 text-blue-500" />}
            currentUserName={userName}
            onToggleComplete={handleToggleComplete}
            onDelete={handleDeleteTask}
            onAddComment={handleAddComment}
            emptyMessage="未完了のタスクはありません"
          />
          <Column
            title="完了済み"
            tasks={completedTasks}
            icon={<CheckCircle2 className="h-5 w-5 text-green-500" />}
            currentUserName={userName}
            onToggleComplete={handleToggleComplete}
            onDelete={handleDeleteTask}
            onAddComment={handleAddComment}
            emptyMessage="完了したタスクはありません"
          />
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="bg-card border rounded-lg shadow-lg">
              <div className="flex items-start gap-3 p-4">
                <GripVertical className="h-5 w-5 mt-1 text-muted-foreground" />
                <Checkbox checked={activeTask.completed} className="mt-1" />
                <span
                  className={`flex-1 text-sm leading-relaxed ${
                    activeTask.completed ? "line-through text-muted-foreground" : ""
                  }`}
                >
                  {activeTask.text}
                </span>
                <X className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
