export default function getDirectory(path: string) {
    let _path = path.split(/[\\\/]/);
    if (_path[_path.length - 1].includes(".")) _path.pop();
    return _path.join("\\");
}