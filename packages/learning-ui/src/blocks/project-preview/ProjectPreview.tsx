import { ProjectPreviewView } from "./ProjectPreviewView";

export function ProjectPreview(props: { title: string; description?: string; features?: string[]; techStack?: string[]; imageUrl?: string }) {
  return <ProjectPreviewView config={{ ...props, features: props.features ?? [] }} />;
}
