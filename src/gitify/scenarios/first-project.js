export default async function run({
  progress,
  log,
  diffProps,
}) {
  if (progress.projectCount === 0 ) {
    return true;
  }
  return false;
}
