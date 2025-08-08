export interface Task {
  id: string;
  text: string;
  done?: boolean;
}

export interface Column {
  id: string;
  title: string;
  tasks: Task[];
}
