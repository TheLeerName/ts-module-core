import Core from "./index.js";

export const ms = {
	delayBetweenTasks: 250,
	timeout: 5000
};

export const queueTasks: string[] = [];
export const tasks: Record<string, [(signal: AbortSignal) => Promise<any>, (value: any) => void]> = {};
export let isProcessing: boolean = false;

export async function queue<Result>(id: string, func: (signal: AbortSignal) => Promise<Result>, prepend = false) {
	return await new Promise<Result>(async(resolve) => {
		const existingTask = tasks[id];
		if (existingTask) {
			Core.log.warn(`Queued task superseded by new task`, {args: {id}});
			const oldResolve = existingTask[1];
			existingTask[0] = func;
			existingTask[1] = result => {
				oldResolve(result);
				resolve(result);
			};
			return;
		}

		Core.log.verbose(`Task was queued`, {args: {id}});
		tasks[id] = [func, resolve];
		if (prepend)
			queueTasks.unshift(id);
		else
			queueTasks.push(id);
		processQueue();
	});
}

function processQueue() {
	if (isProcessing) return;
	isProcessing = true;

	if (queueTasks.length > 0) {
		const id = queueTasks.shift()!;
		executeTask(id).finally(async() => {
			await new Promise(resolve => setTimeout(resolve, ms.delayBetweenTasks));
			isProcessing = false;
			processQueue();
		});
	}
	else
		isProcessing = false;
}

async function executeTask(id: string) {
	const task = tasks[id];
	if (!task) return;

	Core.log.verbose(`Task was started`, {args: {id}});

	try {
		const controller = new AbortController();

		const timeoutPromise = new Promise((_, reject) => {
			setTimeout(() => {
				reject(new Error("queue_timeout"));
			}, ms.timeout);
		});

		const taskPromise = task[0](controller.signal);

		const result = await Promise.race([taskPromise, timeoutPromise]);

		controller.abort();
		task[1](result);
		delete tasks[id];
		Core.log.verbose(`Task was ended`, {args: {id}});
	}
	catch (error) {
		if (error instanceof Error && error.message === "queue_timeout") {
			Core.log.warn(`Working task was readded to queue (timeout)`, { args: { id } });
			queueTasks.unshift(id);
			return;
		}

		Core.log.error(error);
		delete tasks[id];
	}
}