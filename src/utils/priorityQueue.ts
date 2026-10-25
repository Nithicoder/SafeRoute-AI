/**
 * Min-Priority Queue backed by a Binary Heap.
 * Elements with lower priority numbers are dequeued first.
 */

export interface PriorityItem<T> {
  element: T;
  priority: number;
}

export class PriorityQueue<T> {
  private heap: PriorityItem<T>[] = [];

  constructor(items?: PriorityItem<T>[]) {
    if (items) {
      this.heap = [...items];
      for (let i = Math.floor(this.heap.length / 2) - 1; i >= 0; i--) {
        this.siftDown(i);
      }
    }
  }

  public get size(): number {
    return this.heap.length;
  }

  public isEmpty(): boolean {
    return this.heap.length === 0;
  }

  public enqueue(element: T, priority: number): void {
    this.heap.push({ element, priority });
    this.siftUp(this.heap.length - 1);
  }

  public dequeue(): PriorityItem<T> | undefined {
    if (this.isEmpty()) return undefined;
    const top = this.heap[0];
    const bottom = this.heap.pop();
    if (this.heap.length > 0 && bottom !== undefined) {
      this.heap[0] = bottom;
      this.siftDown(0);
    }
    return top;
  }

  public peek(): PriorityItem<T> | undefined {
    return this.heap[0];
  }

  public getElements(): T[] {
    return this.heap.map((item) => item.element);
  }

  public clear(): void {
    this.heap = [];
  }

  private siftUp(index: number): void {
    let current = index;
    while (current > 0) {
      const parent = Math.floor((current - 1) / 2);
      if (this.heap[current].priority < this.heap[parent].priority) {
        this.swap(current, parent);
        current = parent;
      } else {
        break;
      }
    }
  }

  private siftDown(index: number): void {
    let current = index;
    const length = this.heap.length;

    while (true) {
      const left = 2 * current + 1;
      const right = 2 * current + 2;
      let smallest = current;

      if (left < length && this.heap[left].priority < this.heap[smallest].priority) {
        smallest = left;
      }
      if (right < length && this.heap[right].priority < this.heap[smallest].priority) {
        smallest = right;
      }

      if (smallest !== current) {
        this.swap(current, smallest);
        current = smallest;
      } else {
        break;
      }
    }
  }

  private swap(i: number, j: number): void {
    const temp = this.heap[i];
    this.heap[i] = this.heap[j];
    this.heap[j] = temp;
  }
}
